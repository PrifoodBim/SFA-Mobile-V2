import { Collection, createId } from "./collection"
import { db, ensureTable, toBindValue } from "./database"

export type Where<T> = Partial<Record<keyof T & string, unknown>>

export type SortBy<T> = {
  field: keyof T & string
  descending?: boolean
}

export type QueryOptions<T> = {
  /** Equality filters, evaluated in SQLite. */
  where?: Where<T>
  /** Extra filtering in JS, for ranges and other non-equality conditions. */
  filter?: (doc: T) => boolean
  sort?: SortBy<T>
}

type Row = { id: string; data: string }

function revive<T>(collection: Collection<T>, data: string): T {
  const doc = JSON.parse(data) as Record<string, unknown>
  for (const field of collection.dates) {
    const value = doc[field]
    if (typeof value === "string") {
      doc[field] = new Date(value)
    }
  }
  return doc as T
}

function keyOf<T>(collection: Collection<T>, doc: T): string {
  const key = doc[collection.primaryKey]
  if (key === undefined || key === null) {
    throw new Error(
      `${collection.name}: document is missing primary key "${collection.primaryKey}"`,
    )
  }
  return String(key)
}

function compare(a: unknown, b: unknown) {
  const left = a instanceof Date ? a.getTime() : a
  const right = b instanceof Date ? b.getTime() : b
  if (left === right) return 0
  if (left === undefined || left === null) return -1
  if (right === undefined || right === null) return 1
  return (left as number) < (right as number) ? -1 : 1
}

export function query<T>(
  collection: Collection<T>,
  options: QueryOptions<T> = {},
): T[] {
  ensureTable(collection)
  const entries = Object.entries(options.where ?? {})
  const clause = entries.length
    ? ` WHERE ${entries.map(([field]) => `json_extract(data, '$.${field}') = ?`).join(" AND ")}`
    : ""
  const rows = db.getAllSync<Row>(
    `SELECT id, data FROM "${collection.name}"${clause}`,
    entries.map(([, value]) => toBindValue(value)),
  )
  let docs = rows.map(row => revive(collection, row.data))
  if (options.filter) {
    docs = docs.filter(options.filter)
  }
  if (options.sort) {
    const { field, descending } = options.sort
    docs.sort((a, b) => compare(a[field], b[field]) * (descending ? -1 : 1))
  }
  return docs
}

export function findOne<T>(
  collection: Collection<T>,
  options: QueryOptions<T> = {},
): T | undefined {
  return query(collection, options)[0]
}

export function findById<T>(
  collection: Collection<T>,
  id: string | number,
): T | undefined {
  ensureTable(collection)
  const row = db.getFirstSync<Row>(
    `SELECT id, data FROM "${collection.name}" WHERE id = ?`,
    [String(id)],
  )
  return row ? revive(collection, row.data) : undefined
}

/** Inserts a document, generating `_id` when the collection uses it and it is missing. */
export function insert<T>(collection: Collection<T>, doc: T): T {
  ensureTable(collection)
  const record = { ...doc } as Record<string, unknown>
  if (collection.primaryKey === "_id" && record._id === undefined) {
    record._id = createId()
  }
  db.runSync(`INSERT INTO "${collection.name}" (id, data) VALUES (?, ?)`, [
    keyOf(collection, record as T),
    JSON.stringify(record),
  ])
  return record as T
}

/**
 * Inserts or merges a document by primary key
 * (same as Realm's `create(..., UpdateMode.Modified)`).
 */
export function upsert<T>(collection: Collection<T>, doc: Partial<T>): T {
  ensureTable(collection)
  const record = { ...doc } as Record<string, unknown>
  if (collection.primaryKey === "_id" && record._id === undefined) {
    record._id = createId()
  }
  const id = keyOf(collection, record as T)
  const existing = findById(collection, id)
  const merged = { ...(existing ?? {}), ...record } as T
  db.runSync(
    `INSERT INTO "${collection.name}" (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
    [id, JSON.stringify(merged)],
  )
  return merged
}

/**
 * Writes many full documents by primary key with a single prepared statement.
 * Unlike `upsert`, it does not merge with the stored row, so pass complete documents.
 * Wrap in `write()` so it runs in one transaction.
 */
export function upsertMany<T>(collection: Collection<T>, docs: T[]) {
  ensureTable(collection)
  const statement = db.prepareSync(
    `INSERT INTO "${collection.name}" (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
  )
  try {
    for (const doc of docs) {
      const record = { ...doc } as Record<string, unknown>
      if (collection.primaryKey === "_id" && record._id === undefined) {
        record._id = createId()
      }
      statement.executeSync([
        keyOf(collection, record as T),
        JSON.stringify(record),
      ])
    }
  } finally {
    statement.finalizeSync()
  }
}

export function update<T>(
  collection: Collection<T>,
  id: string | number,
  changes: Partial<T>,
): T | undefined {
  const existing = findById(collection, id)
  if (!existing) {
    return undefined
  }
  return upsert(collection, { ...existing, ...changes })
}

export function remove<T>(collection: Collection<T>, docs: T | T[]) {
  ensureTable(collection)
  for (const doc of Array.isArray(docs) ? docs : [docs]) {
    db.runSync(`DELETE FROM "${collection.name}" WHERE id = ?`, [
      keyOf(collection, doc),
    ])
  }
}

export function removeAll<T>(collection: Collection<T>) {
  ensureTable(collection)
  db.runSync(`DELETE FROM "${collection.name}"`)
}

/** Runs several writes atomically (replacement for `realm.write`). */
export function write<R>(task: () => R): R {
  let result: R | undefined
  db.withTransactionSync(() => {
    result = task()
  })
  return result as R
}

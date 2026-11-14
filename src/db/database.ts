import { openDatabaseSync, SQLiteBindValue } from "expo-sqlite"
import { Collection } from "./collection"

export const db = openDatabaseSync("prifood.db", { enableChangeListener: true })

db.execSync("PRAGMA journal_mode = WAL;")

const createdTables = new Set<string>()

/** Lazily creates the backing table of a collection. */
export function ensureTable(collection: Pick<Collection<unknown>, "name">) {
  if (createdTables.has(collection.name)) {
    return
  }
  db.execSync(
    `CREATE TABLE IF NOT EXISTS "${collection.name}" (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);`,
  )
  createdTables.add(collection.name)
}

export function toBindValue(value: unknown): SQLiteBindValue {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0
  }
  if (value === undefined) {
    return null
  }
  return value as SQLiteBindValue
}

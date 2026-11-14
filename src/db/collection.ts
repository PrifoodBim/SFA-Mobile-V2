import { randomUUID } from "expo-crypto"

/**
 * A collection is a table of JSON documents (the replacement for a Realm model).
 * Nested lists (lines, imageDetails, ...) are stored inline in the document.
 */
export type Collection<T> = {
  name: string
  primaryKey: keyof T & string
  /** Fields stored as ISO strings and revived to `Date` when read. */
  dates: ReadonlyArray<keyof T & string>
}

type CollectionOptions<T> = {
  name: string
  primaryKey?: keyof T & string
  dates?: ReadonlyArray<keyof T & string>
}

export function defineCollection<T>(
  options: CollectionOptions<T>,
): Collection<T> {
  return {
    name: options.name,
    primaryKey: (options.primaryKey ?? "_id") as keyof T & string,
    dates: options.dates ?? [],
  }
}

/** Replacement for `new BSON.ObjectId()`. */
export const createId = () => randomUUID()

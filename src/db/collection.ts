import { getRandomBytes } from "expo-crypto"

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

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")

/** Length of generated ids; must fit the server `TransId` columns (30 chars). */
export const ID_LENGTH = 25

/**
 * Replacement for `new BSON.ObjectId()`: a 25-char hex id (8-char timestamp +
 * 17 random hex chars). It is sent to the server as `TransId`, so it must stay
 * short enough for those columns (30 chars), unlike a 36-char UUID.
 */
export const createId = () => {
  const time = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0")
  return (time + toHex(getRandomBytes(9))).slice(0, ID_LENGTH)
}

/**
 * The `TransId` sent to the server for a local record id. Records created
 * before this change have 36-char UUIDs, which overflow the server column:
 * those are shortened to 25 hex chars (stable for the same id).
 */
export const toTransId = (id: string) =>
  id.length <= ID_LENGTH ? id : id.replace(/-/g, "").slice(0, ID_LENGTH)

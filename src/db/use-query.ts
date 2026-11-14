import { addDatabaseChangeListener } from "expo-sqlite"
import { DependencyList, useEffect, useMemo, useState } from "react"
import { Collection } from "./collection"
import { query, QueryOptions } from "./repository"

/**
 * Live query: re-runs whenever the collection's table changes
 * (replacement for Realm's `useQuery`).
 *
 * `deps` must list the values a `filter` callback closes over.
 */
export function useQuery<T>(
  collection: Collection<T>,
  options: QueryOptions<T> = {},
  deps: DependencyList = [],
): T[] {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const subscription = addDatabaseChangeListener(event => {
      if (event.tableName === collection.name) {
        setVersion(value => value + 1)
      }
    })
    return () => subscription.remove()
  }, [collection.name])

  const where = JSON.stringify(options.where ?? {})
  const sort = JSON.stringify(options.sort ?? null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(
    () => query(collection, options),
    [collection, version, where, sort, ...deps],
  )
}

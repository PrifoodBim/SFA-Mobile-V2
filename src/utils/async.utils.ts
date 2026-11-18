/**
 * Like `Promise.all(items.map(fn))`, but runs at most `limit` calls at a time.
 * Results keep the order of `items`. Use it for network work (uploads, image
 * downloads) so a large batch doesn't open hundreds of requests at once.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Array.from(
    { length: Math.min(Math.max(1, limit), items.length) },
    worker,
  )
  await Promise.all(workers)
  return results
}

/** Concurrent uploads per sync step. */
export const UPLOAD_CONCURRENCY = 4
/** Concurrent file downloads per sync step. */
export const DOWNLOAD_CONCURRENCY = 6

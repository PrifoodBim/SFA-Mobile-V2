/** Product name without the trailing size/packing part (from the first digit on). */
export function getProductName(input: string) {
  return input.replace(/\d.*$/, "").trim()
}

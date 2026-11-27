export const getPermission = (
  permissions: Record<string, string> | undefined,
  key: string,
) => {
  if (permissions && Object.prototype.hasOwnProperty.call(permissions, key)) {
    return permissions[key]
  }
  return false
}

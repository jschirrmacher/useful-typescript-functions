/**
 * Rename an attribute in an object. This higher level function returns a mapper which can be used
 * in an `Array.map()` call. Example:
 * 
 *    const mappedUsers = users.map(renameAttribute("name", "firstName"))
 * 
 * @param from previous name of attribute
 * @param to new name of attribute
 * @returns (obj: Record<string, any>) => T
 */
export function renameAttribute<T extends object>(from: string, to: keyof T) {
  return (obj: Record<string, any>) => {
    const { [from]: value, ...others } = obj
    return { ...others, [to]: value } as T
  }
}

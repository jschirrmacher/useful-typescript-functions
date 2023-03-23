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
export declare function renameAttribute<T extends object>(from: string, to: keyof T): (obj: Record<string, any>) => T;

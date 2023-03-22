import { Arrayized, BaseType, FlatObject, StringIndexableObject } from "./types"

/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be desctructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export function arrayize(obj: BaseType | StringIndexableObject): Arrayized[] {
  const concat = (...parts: string[]) => parts.filter((x) => x).join(".")

  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.entries(obj as StringIndexableObject).flatMap(([key, value]) => {
      if (value === null) {
        return [[key, value]]
      }
      return arrayize(value).map((e) => [concat(key, e[0]), e[1]]) as Arrayized[]
    })
  }
  return [["", obj]]
}

/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting levels.
 *
 * @param obj original, deeply nested object
 * @returns flat object of only one level, but with property names containing paths of the original object
 */
export function flatten(obj: BaseType | StringIndexableObject): FlatObject {
  return Object.fromEntries(arrayize(obj))
}

/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export function inflate(obj: FlatObject) {
  return Object.entries(obj).reduce((obj, [path, value]) => {
    const splitted = path.split(".")
    const last = splitted.pop() as string
    let pointer = obj
    splitted.forEach((p) => {
      if (!pointer[p]) {
        pointer[p] = {}
      }
      pointer = pointer[p] as StringIndexableObject
    })
    pointer[last] = value
    return obj
  }, {} as StringIndexableObject)
}

/**
 * @deprecated use `flatten()` instead
 */
export const flattenObject = flatten

/**
 * @deprecated use `inflate()` instead
 */
export const inflateObject = inflate

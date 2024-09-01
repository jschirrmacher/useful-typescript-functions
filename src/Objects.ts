import { Arrayized, NestedValue, PathValue } from "./types.js"

function union(arr1: string[], arr2: string[]) {
  return [...new Set([...arr1, ...arr2])]
}

/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be destructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export function arrayize(obj: unknown): Arrayized[] {
  const concat = (...parts: string[]) => parts.filter(x => x).join(".")

  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.entries(obj).flatMap(([key, value]) => {
      if (value === null) {
        return [[key, null]]
      }
      return arrayize(value).map(e => [concat(key, e[0]), e[1]]) as Arrayized[]
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
export function flatten(obj: unknown) {
  return Object.fromEntries(arrayize(obj))
}

function setPath<T extends object, K extends string>(
  obj: T,
  path: K[],
  value: NestedValue<K>,
): T | NestedValue<K> {
  const [head, ...tail] = path
  const index = Number(head)

  if (path.length === 0) {
    return value as T | NestedValue<K>
  }

  if (!isNaN(index)) {
    const array = Array.isArray(obj) ? obj : []
    array[index] = setPath((array[index] ?? {}) as T, tail, value)
    return array as unknown as T | NestedValue<K>
  } else {
    const nestedObj = obj && typeof obj === "object" ? { ...obj } : ({} as T)
    const key = head as unknown as keyof T
    nestedObj[key] = setPath(nestedObj[key] as object, tail, value) as T[keyof T]
    return nestedObj as T | NestedValue<K>
  }
}

/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export function inflate<T extends PathValue>(paths: T) {
  return Object.entries(paths).reduce(
    (acc, [path, value]) => {
      const pathParts = path.replace(/\[(\d+)\]/g, ".$1").split(".") as (keyof T & string)[]
      return setPath(acc as object, pathParts, value as NestedValue<keyof T & string>)
    },
    {} as object | NestedValue<keyof T & string>,
  ) as NestedValue<keyof T & string>
}

/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param other modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
export function diff(
  from: object,
  other: object,
  include: "from" | "to" | "both" = "both",
) {
  const values1 = flatten(from)
  const values2 = flatten(other)

  const valueMapping = {
    from: (p: string) => [p, values1[p]],
    to: (p: string) => [p, values2[p]],
    both: (p: string) => [p, { from: values1[p], to: values2[p] }],
  }

  const changes = union(Object.keys(values1), Object.keys(values2))
    .filter(p => values1[p] !== values2[p])
    .map(p => valueMapping[include](p))

  return inflate(Object.fromEntries(changes))
}

/**
 * Checks if an object contains another one.
 *
 * @param object object to compare
 * @param other object which might be contained in first object
 * @returns true if the current object contains the other one.
 */
export function objectContains<T extends object>(object: T, other: T) {
  const flat1 = flatten(object)
  return arrayize(other).every(([key, value]) => flat1[key] === value)
}

export function objectContaining<T extends object>(contains: T) {
  return {
    asymmetricMatch(obj: T) {
      return objectContains(obj, contains)
    },
  }
}

/**
 * Rename an attribute in an object. This higher level function returns a mapper which can be used
 * in an `Array.map()` call. Example:
 *
 *     const mappedUsers = users.map(renameAttribute("name", "firstName"))
 *
 * @param from previous name of attribute
 * @param to new name of attribute
 * @returns (obj: Record<string, unknown>) => T
 */
export function renameAttribute<T extends object>(from: string, to: keyof T) {
  return (obj: Record<string, unknown>) => {
    const { [from]: value, ...others } = obj
    return { ...others, [to]: value } as T
  }
}

/**
 * Returns an object containing allowed changes to an original object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns Object containing allowed changes to an original object
 */
export function getMutation<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
  const actualChanges = attributes
    .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
    .map(attribute => ({ [attribute]: changes[attribute] }))
  return Object.assign({}, ...actualChanges) as T
}

/**
 * Mutates an object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns The mutated object
 */
export function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
  return { ...obj, ...getMutation(obj, attributes, changes) }
}

/**
 * Extract properties with values from an object.
 *
 * @param obj
 * @param props
 * @returns new object with the extracted properties with values
 */
export function extract<T extends object>(obj: T, props: (keyof T)[]) {
  return Object.fromEntries(props.map(prop => [prop, obj[prop]]))
}

export function createObject<T extends object>(
  obj: T,
  writableAttributes = Object.getOwnPropertyNames(obj) as Array<keyof T>,
) {
  const data: T = obj || ({} as T)

  const base = {
    /**
     * Find the differences to the given object.
     *
     * @param other object
     * @param include defines which values the result should include
     * @returns a new object containing only the properties which are modified with the original and the modified values.
     */
    diff(other: Partial<T>, include: "from" | "to" | "both" = "both") {
      return diff(data, other, include)
    },

    /**
     * Checks if the current object contains another one.
     *
     * @param other object to compare with
     * @returns true if the current object contains the other one.
     */
    contains(other: Partial<T>) {
      return objectContains(data, other)
    },

    /**
     * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
     *
     * @returns List of paths with values in the given object
     */
    arrayize() {
      return arrayize(data)
    },

    /**
     * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
     *
     * @returns flat object of only one level, but with property names containing paths of the original object
     */
    flatten() {
      return createObject(flatten(data))
    },

    /**
     * Inflate a flattened object (with paths as property names) to a deeply nested object
     *
     * @returns Re-inflated object, which may contain a nesting structure.
     */
    inflate() {
      return createObject(inflate(data as PathValue) as object)
    },

    /**
     * Mutates the object.
     * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
     *
     * @param changes An object with the attributes and values to change
     * @returns The mutated object
     */
    mutate(changes: Partial<T>): T {
      const mutated = mutate(data, writableAttributes, changes)
      return createObject(mutated, writableAttributes)
    },

    /**
     * Extract some properties of the object.
     * @param props
     * @returns a new object containing only the extracted properties and values.
     */
    extract(props: (keyof T)[]) {
      return createObject(extract(data, props))
    },
  }

  return Object.setPrototypeOf(data, base) as T & typeof base
}

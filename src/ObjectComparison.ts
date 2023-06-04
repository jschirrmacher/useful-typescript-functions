import { arrayize, flatten } from "./flattenInflate.js"
import { StringIndexableObject } from "./types.js"

export function objectContains(obj1: StringIndexableObject, contains: StringIndexableObject) {
  const flat1 = flatten(obj1)
  return arrayize(contains).every(([key, value]) => flat1[key] === value)
}

export function objectContaining(contains: StringIndexableObject) {
  return {
    asymmetricMatch(obj: StringIndexableObject) {
      return objectContains(obj, contains)
    },
  }
}

import { describe, expect, it } from "vitest"
import { arrayize, flatten } from "./flattenInflate"

describe("flattenInflate", () => {
  describe("arrayize", () => {
    it("should return a list of property values", () => {
      expect(arrayize(null)).toEqual([["", null]])
      expect(arrayize({ a: 1 })).toEqual([["a", 1]])
      expect(arrayize({ a: 1, b: { c: 2 } })).toEqual([
        ["a", 1],
        ["b.c", 2],
      ])
      expect(arrayize({ a: { b: 1 }, b: { a: 2 } })).toEqual([
        ["a.b", 1],
        ["b.a", 2],
      ])
    })

    it("should recognize Dates", () => {
      const date = new Date()
      expect(arrayize({ a: date })).toEqual([["a", date]])
    })
  })

  describe("flatten", () => {
    it("should return a flat object with all values", () => {
      const date = new Date()
      expect(flatten(null)).toEqual({ "": null })
      expect(flatten({ a: undefined })).toEqual({ a: undefined })
      expect(flatten({ a: 1 })).toEqual({ a: 1 })
      expect(flatten({ a: date })).toEqual({ a: date })
      expect(flatten({ a: 1, b: { c: 2 } })).toEqual({ a: 1, "b.c": 2 })
      expect(flatten({ a: { b: 1 }, b: { a: 2 } })).toEqual({ "a.b": 1, "b.a": 2 })
    })
  })
})

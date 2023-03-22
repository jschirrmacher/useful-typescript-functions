import { describe, expect, it } from "vitest"
import { flattenObject, diff, arrayize, inflateObject } from "."

describe("objectUtils", () => {
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

  describe("flattenObject", () => {
    it("should return a flat object with all values", () => {
      const date = new Date()
      expect(flattenObject(null)).toEqual({ "": null })
      expect(flattenObject({ a: undefined })).toEqual({ a: undefined })
      expect(flattenObject({ a: 1 })).toEqual({ a: 1 })
      expect(flattenObject({ a: date })).toEqual({ a: date })
      expect(flattenObject({ a: 1, b: { c: 2 } })).toEqual({ a: 1, "b.c": 2 })
      expect(flattenObject({ a: { b: 1 }, b: { a: 2 } })).toEqual({ "a.b": 1, "b.a": 2 })
    })
  })

  describe("InflateObject", () => {
    it("should construct a deeply nested object", () => {
      expect(
        inflateObject({
          "a.b.c": 1,
          "a.b.d": 2,
          "b.d": 3,
          "b.e.f": 4,
        })
      ).toEqual({
        a: {
          b: { c: 1, d: 2 },
        },
        b: { d: 3, e: { f: 4 } },
      })
    })
  })

  describe("diff", () => {
    it("should return no differences if objects are identical", () => {
      expect(diff({ a: 1 }, { a: 1 })).toEqual({})
    })

    it("should list scalar attributes with the previous value", () => {
      expect(diff({ a: 1 }, { a: 2 })).toEqual({ a: { from: 1, to: 2 } })
    })

    it("should recurse into sub objects", () => {
      expect(diff({ deep: { a: 1 } }, { deep: { a: 2 } })).toEqual({
        deep: { a: { from: 1, to: 2 } },
      })
    })

    it("should ignore unchanged properties", () => {
      expect(diff({ deep: { a: 1, b: 3 } }, { deep: { a: 2, b: 3 } })).toEqual({
        deep: { a: { from: 1, to: 2 } },
      })
    })

    it("should handle new sub objects", () => {
      expect(diff({ a: { b: 1 } }, { a: { b: 1 }, b: { a: 2 } })).toEqual({
        b: { a: { from: undefined, to: 2 } },
      })
    })

    it("should handle disappearing sub objects", () => {
      expect(diff({ a: { b: 1 }, b: { a: 2 } }, { a: { b: 1 } })).toEqual({
        b: { a: { from: 2, to: undefined } },
      })
    })

    it("should compare Dates", () => {
      const date = new Date()
      const newDate = new Date(+date + 3600_000)
      expect(diff({ a: date }, { a: newDate })).toEqual({ a: { from: date, to: newDate } })
    })

    it("works with 'from' param", () => {
      expect(
        diff({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "from")
      ).toEqual({ b: 2, d: 4, e: undefined })
    })

    it("works with 'to' param", () => {
      expect(
        diff({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "to")
      ).toEqual({ b: 3, d: undefined, e: 5 })
    })
  })
})

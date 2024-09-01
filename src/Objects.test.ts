import { describe, expect, it } from "vitest"
import {
  arrayize,
  createObject,
  diff,
  extract,
  flatten,
  getMutation,
  inflate,
  mutate,
  objectContaining,
  objectContains,
  renameAttribute,
} from "./Objects"

describe("Objects", () => {
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
        diff({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "from"),
      ).toEqual({ b: 2, d: 4, e: undefined })
    })

    it("works with 'to' param", () => {
      expect(
        diff({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "to"),
      ).toEqual({ b: 3, d: undefined, e: 5 })
    })
  })

  describe("flattenInflate", () => {
    describe("arrayize", () => {
      it("should return a list of property values", () => {
        expect(arrayize(null)).toEqual([["", null]])
        expect(arrayize(1)).toEqual([["", 1]])
        const date = new Date()
        expect(arrayize(date)).toEqual([["", date]])
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

      it("should arrayize arrays", () => {
        expect(arrayize([3, 2, 1])).toEqual([
          ["0", 3],
          ["1", 2],
          ["2", 1],
        ])
      })
    })

    describe("flatten", () => {
      it("should return a flat object with all values", () => {
        const date = new Date()
        expect(flatten(null)).toEqual({ "": null })
        expect(flatten(42)).toEqual({ "": 42 })
        expect(flatten({ a: undefined })).toEqual({ a: undefined })
        expect(flatten({ a: 1 })).toEqual({ a: 1 })
        expect(flatten({ a: date })).toEqual({ a: date })
        expect(flatten({ a: 1, b: { c: 2 } })).toEqual({ a: 1, "b.c": 2 })
        expect(flatten({ a: { b: 1 }, b: { a: 2 } })).toEqual({ "a.b": 1, "b.a": 2 })
        expect(flatten([3, 2, 1])).toEqual({ "0": 3, "1": 2, "2": 1 })
        expect(flatten({ a: [3, 2, { b: 1 }] })).toEqual({ "a.0": 3, "a.1": 2, "a.2.b": 1 })
      })
    })

    describe("inflate", () => {
      it("should inflate flattened data correctly", () => {
        const data = { a: { b: [3, 2, 1], c: true, d: new Date() } }
        expect(inflate(flatten(data))).toEqual(data)
      })
    })
  })

  describe("objectContains()", () => {
    it("should check only the parts specified in the second object", () => {
      expect(objectContains({ a: 1, b: "c" }, { b: "c" })).toBe(true)
    })

    it("should return false if something is different in first object", () => {
      expect(objectContains({ a: 1, b: "c" }, { b: "d" })).toBe(false)
    })

    it("should return false if something is missing in first object", () => {
      expect(objectContains({ a: 1 }, { b: "c" })).toBe(false)
    })
  })

  describe("objectContaining()", () => {
    it("should return an object containing an asymmetricMatch() function", () => {
      const matcher = objectContaining({ a: 1 } as Record<string, unknown>)
      expect(matcher).toBeInstanceOf(Object)
      expect(matcher).toHaveProperty("asymmetricMatch")
      expect(matcher.asymmetricMatch({ a: 1 })).toBe(true)
      expect(matcher.asymmetricMatch({ b: 2 })).toBe(false)
    })
  })

  describe("renameAttribute", () => {
    it("should rename an attribute", () => {
      expect(renameAttribute("a", "b")({ a: 42 })).toEqual({ b: 42 })
    })

    it("should keep other attributes", () => {
      expect(renameAttribute("a", "b")({ a: 42, c: 815 })).toEqual({ b: 42, c: 815 })
    })

    it("should keep non-scalar values", () => {
      expect(renameAttribute("a", "b")({ a: { c: "deep" } })).toEqual({ b: { c: "deep" } })
    })
  })

  const original = { mutable: "a", immutable: 1 }
  const writeableAttributes = ["mutable"] as const

  describe("getMutation", () => {
    it("return a list of changes", () => {
      const result = getMutation(original, writeableAttributes, {
        mutable: "b",
        immutable: 2,
        other: 42,
      } as typeof original)
      expect(result).toEqual({ mutable: "b" })
    })
  })

  describe("mutate", () => {
    it("should restrict changes to allowed attributes", () => {
      const result = mutate(original, writeableAttributes, {
        mutable: "b",
        immutable: 2,
      })
      expect(result).toStrictEqual({ mutable: "b", immutable: 1 })
    })

    it("should ignore unknown attributes", () => {
      const result = mutate(original, writeableAttributes, {
        other: 42,
      } as unknown as typeof original)
      expect(result).toStrictEqual({ mutable: "a", immutable: 1 })
    })

    it("should be possible to empty a mutable field", () => {
      const result = mutate(original, writeableAttributes, {
        mutable: null,
      } as unknown as typeof original)
      expect(result).toStrictEqual({ mutable: null, immutable: 1 })
    })
  })

  describe("extract", () => {
    it("should only contain the requested properties and values", () => {
      const original = { a: 42, b: "test", c: { d: 4711 } }
      expect(extract(original, ["b", "c"])).toEqual({
        b: "test",
        c: { d: 4711 },
      })
    })
  })

  describe("createObject", () => {
    const original = { level: 42, deep: { area: 52 } }
    const created = createObject(original)

    it("should return an object containing the given attributes and values", () => {
      expect(created).toEqual(original)
    })

    it("arrayized() should return the attributes and values in list form", () => {
      expect(created.arrayize()).toEqual([
        ["level", 42],
        ["deep.area", 52],
      ])
    })

    it("contains() should return the expected values", () => {
      expect(created.contains({ level: 42 })).toBe(true)
      expect(created.contains({ deep: { area: 52 } })).toBe(true)
      expect(created.contains({ other: 62 } as unknown as typeof original)).toBe(false)
    })

    it("diff() should return the differences", () => {
      expect(created.diff({ level: 32, deep: { area: 62 } })).toEqual({
        deep: { area: { from: 52, to: 62 } },
        level: { from: 42, to: 32 },
      })
    })

    it("flatten() should collect deep values to top level", () => {
      expect(created.flatten()).toEqual({
        level: 42,
        "deep.area": 52,
      })
    })

    it("inflate() should create deep values", () => {
      const flattened = created.flatten()
      expect(flattened.inflate().contains(original)).toBe(true)
    })

    it("mutate() should mutate attribute values", () => {
      expect(created.mutate({ level: 43 })).toEqual({ level: 43, deep: { area: 52 } })
    })
  })
})

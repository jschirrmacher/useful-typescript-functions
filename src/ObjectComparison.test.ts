import { describe, expect, it } from "vitest"
import { objectContaining, objectContains } from './ObjectComparison';

describe("ObjectComparison", () => {
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
      const matcher = objectContaining({ a: 1 })
      expect(matcher).toBeInstanceOf(Object)
      expect(matcher).toHaveProperty("asymmetricMatch")
      expect(matcher.asymmetricMatch({ a: 1 })).toBe(true)
      expect(matcher.asymmetricMatch({ b: 2 })).toBe(false)
    })
  })
})

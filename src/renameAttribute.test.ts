import { describe, expect, it } from "vitest"
import { renameAttribute } from "./renameAttribute"

describe("renameAttribute", () => {
  it("should rename an attribute", () => {
    expect(renameAttribute("a", "b")({ a: 42 })).toEqual({ b: 42 })
  })

  it("should keep other attributes", () => {
    expect(renameAttribute("a", "b")({ a: 42, c: 815 })).toEqual({ b: 42, c: 815})
  })

  it("should keep non-scalar values", () => {
    expect(renameAttribute("a", "b")({ a: { c: "deep"} })).toEqual({ b: { c: "deep" } })
  })
})

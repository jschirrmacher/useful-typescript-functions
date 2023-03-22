import { describe, expect, it } from "vitest"
import { diff } from "./diff"

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

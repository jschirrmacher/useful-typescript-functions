import { describe, expect, it } from "vitest"
import { mutate, getMutation } from "./mutate"

type ObjectUnderTest = {
  mutable: string
  immutable: number
}

const original: ObjectUnderTest = { mutable: "a", immutable: 1 }
const attributes = ["mutable"] as const

describe("getMutation", () => {
  it("return a list of changes", () => {
    const result = getMutation(original, attributes, { mutable: "b", immutable: 2, other: 42 } as ObjectUnderTest)
    expect(result).toEqual({ mutable: "b" })
  })
})

describe("mutate", () => {
  it("should restrict changes to allowed attributes", () => {
    const result = mutate<ObjectUnderTest>(original, attributes, { mutable: "b", immutable: 2 })
    expect(result).toStrictEqual({ mutable: "b", immutable: 1 })
  })

  it("should ignore unknown attributes", () => {
    const result = mutate(original, attributes, { other: 42 } as unknown as ObjectUnderTest)
    expect(result).toStrictEqual({ mutable: "a", immutable: 1 })
  })

  it("should be possible to empty a mutable field", () => {
    const result = mutate(original, attributes, { mutable: null } as unknown as ObjectUnderTest)
    expect(result).toStrictEqual({ mutable: null, immutable: 1 })
  })
})

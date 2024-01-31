import { Readable } from "stream"
import { describe, expect, it } from "vitest"
import { createObjectStream, streamToArray } from "./Streams"

describe("createObjectStream", () => {
  it("should accept objects", async () => {
    expect(
      await streamToArray(
        Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }]).pipe(createObjectStream()),
      ),
    ).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }])
  })
})

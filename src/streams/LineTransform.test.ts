import { Readable } from "stream"
import { describe, expect, it } from "vitest"
import { streamToArray } from "../Streams.js"
import { createLineTransform } from "./LineTransform.js"

describe("createLineTransform", () => {
  it("should return a TransformStream to extract lines from a ReadableStream", async () => {
    expect(
      await streamToArray<string>(
        Readable.from(`line 1\nline 2\n\nline 3`).pipe(createLineTransform()),
      ),
    ).toEqual(["line 1", "line 2", "line 3"])
  })
})

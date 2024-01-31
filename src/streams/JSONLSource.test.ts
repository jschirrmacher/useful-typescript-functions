import { Readable } from "stream"
import { expect, it } from "vitest"
import { streamToArray } from "../Streams"
import { createJSONLSource } from "./JSONLSource"

it("should return a Stream to extract objects in JSONL format from a Readable", async () => {
  expect(
    await streamToArray(
      createJSONLSource({
        readStream: Readable.from(`{"level":42}\n{"area":52}\n\n{"other":"abc"}`),
      }).run().stream,
    ),
  ).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }])
})

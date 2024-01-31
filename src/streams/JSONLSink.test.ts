import { Readable } from "stream"
import { expect, it } from "vitest"
import { createJSONLSink } from "./JSONLSink.js"
import { createArraySink } from "./ArraySink"

it("should return a sink to generate JSONL from objects", async () => {
  const result = await new Promise((resolve, reject) => {
    const result: string[] = []
    const writeStream = createArraySink(result)
    Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }])
      .pipe(createJSONLSink({ writeStream }))
      .on("finish", () => resolve(result))
      .on("error", reject)
  })

  expect(result).toEqual(['{"level":42}\n', '{"area":52}\n', '{"other":"abc"}\n'])
})

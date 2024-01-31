import { expect, it } from "vitest"
import { createCSVSource } from "./CSVSource"
import { Readable } from "stream"
import { createArraySink } from "./ArraySink"

it("should collect data in the array", async () => {
  const result: string[] = []

  await new Promise(resolve => {
    createCSVSource({ readStream: Readable.from(`level,area,other\n42,52,abc`) })
      .run()
      .stream.pipe(createArraySink(result))
      .on("close", resolve)
  })
  expect(result).toEqual([{ level: "42", area: "52", other: "abc" }])
})

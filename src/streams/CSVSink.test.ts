import { Readable } from "stream"
import { expect, it } from "vitest"
import { createCSVSink } from "../Streams"
import { createArraySink } from "./ArraySink"

function createPipeline(input: unknown[], separator = ",", fields?: string[]) {
  return new Promise((resolve, reject) => {
    const result: string[] = []
    const writeStream = createArraySink(result)
    Readable.from(input)
      .pipe(createCSVSink({ writeStream, separator, fields }))
      .on("finish", () => resolve(result))
      .on("error", reject)
  })
}

it("should use all the fields, if not explicitly specified", async () => {
  expect(await createPipeline([{ level: "42", area: "52" }])).toEqual([
    "level,area\n",
    "42,52\n",
  ])
})

it("should use the fields, if specified, in the specified order", async () => {
  expect(
    await createPipeline([{ level: "42", area: "52" }], ",", ["area", "level", "other"]),
  ).toEqual(["area,level,other\n", "52,42,\n"])
})

it("should work with ';' as a separator", async () => {
  expect(await createPipeline([{ test: "123;abc", other: "def" }], ";")).toEqual([
    `test;other\n`,
    `"123;abc";def\n`,
  ])
})

it("should emit a title line with all field names of the given object", async () => {
  expect(await createPipeline([{ level: "42", area: "52", other: "abc" }])).toEqual([
    "level,area,other\n",
    "42,52,abc\n",
  ])
})

it("should not write additional fields of subsequent objects", async () => {
  expect(await createPipeline([{ test: "abc", other: "xyz" }, { different: "123" }])).toEqual([
    "test,other\n",
    "abc,xyz\n",
    ",\n",
  ])
})

it("should escape double quotes properly", async () => {
  expect(await createPipeline([{ test: 'abc"xyz' }])).toEqual(["test\n", 'abc""xyz\n'])
})

it("should escape commas properly", async () => {
  expect(await createPipeline([{ test: "abc,xyz" }])).toEqual(["test\n", '"abc,xyz"\n'])
})

it("should escape newline characters properly", async () => {
  expect(await createPipeline([{ test: "abc\nxyz" }])).toEqual(["test\n", '"abc\\nxyz"\n'])
})

it("should log numerical zeros as such", async () => {
  expect(await createPipeline([{ test: 0 }])).toEqual(["test\n", "0\n"])
})

it("should log dates in ISO 8601 format in UTC", async () => {
  expect(await createPipeline([{ test: new Date("2023-11-05T20:23Z") }])).toEqual([
    "test\n",
    "2023-11-05T20:23:00.000Z\n",
  ])
})

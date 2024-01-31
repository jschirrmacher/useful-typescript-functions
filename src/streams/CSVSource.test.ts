import { Readable } from "stream"
import { expect, it } from "vitest"
import { createCSVSource, streamToArray } from "../Streams"

async function createPipeline(input: string, separator = ",") {
  const pipeline = createCSVSource({ readStream: Readable.from(input), separator }).run()
  return await streamToArray(pipeline.stream)
}

it("should return a Source to extract objects from a Readable", async () => {
  expect(await createPipeline(`level,area,other\n42,52,abc`)).toEqual([
    { level: "42", area: "52", other: "abc" },
  ])
})

it("should unescape all characters properly", async () => {
  expect(await createPipeline(`test,other\n"123""abc",def\nghi,\n"uvw\\nx,yz",456\n`)).toEqual([
    { test: '123"abc', other: "def" },
    { test: "ghi", other: "" },
    { test: "uvw\nx,yz", other: "456" },
  ])
})

it("should work with ';' as a separator", async () => {
  expect(await createPipeline(`test;other\n"123;abc";def\n`, ";")).toEqual([
    { test: "123;abc", other: "def" },
  ])
})

it("should work with a predefined list of fields", async () => {
  const pipeline = createCSVSource({
    readStream: Readable.from(`level,area,other,test\n42,52,abc,def`),
    fields: ["test", "area"],
  }).run()
  expect(await streamToArray(pipeline.stream)).toEqual([{ area: "52", test: "def" }])
})

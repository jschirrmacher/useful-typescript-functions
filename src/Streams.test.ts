import { Readable } from "stream"
import { describe, expect, it } from "vitest"
import {
  createCSV2ObjectTransform,
  createJSONL2ObjectTransform,
  createLineTransform,
  createObject2CSVTransform,
  createObjectStream,
  createObjectToJSONLTransform,
  streamToArray,
} from "./Streams"

describe("Streams", () => {
  describe("createLineTransform", () => {
    it("should return a TransformStream to extract lines from a ReadableStream", async () => {
      expect(
        await streamToArray<string>(
          Readable.from(`line 1\nline 2\n\nline 3`).pipe(createLineTransform()),
        ),
      ).toEqual(["line 1", "line 2", "line 3"])
    })
  })

  describe("createJSONL2ObjectTransform", () => {
    it("should return a TransformStream to extract lines from a Readable", async () => {
      expect(
        await streamToArray(
          Readable.from(`{"level":42}\n{"area":52}\n\n{"other":"abc"}`)
            .pipe(createLineTransform())
            .pipe(createJSONL2ObjectTransform()),
        ),
      ).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }])
    })
  })

  describe("createObject2JSONLTransform", () => {
    it("should return a TransformStream to generate JSONL from objects", async () => {
      expect(
        await streamToArray(
          Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }]).pipe(
            createObjectToJSONLTransform(),
          ),
        ),
      ).toEqual(['{"level":42}\n', '{"area":52}\n', '{"other":"abc"}\n'])
    })
  })

  describe("createObjectStream", () => {
    it("should accept objects", async () => {
      expect(
        await streamToArray(
          Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }]).pipe(createObjectStream()),
        ),
      ).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }])
    })
  })

  describe("createCSV2ObjectTransform", () => {
    function createPipeline(input: string, separator = ",") {
      return streamToArray(
        Readable.from(input).pipe(createLineTransform()).pipe(createCSV2ObjectTransform(separator)),
      )
    }

    it("should return a TransformStream to extract lines from a ReadableStream", async () => {
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
  })

  describe("createObject2CSVTransform", () => {
    function createPipeline(input: unknown[], separator = ",", fields?: string[]) {
      return streamToArray(Readable.from(input).pipe(createObject2CSVTransform(separator, fields)))
    }

    it("should use all the fields, if specified", async () => {
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
  })
})

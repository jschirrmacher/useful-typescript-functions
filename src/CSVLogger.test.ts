import { beforeEach, describe, expect, it, vi } from "vitest"
import { CSVLogger } from "./CSVLogger.js"
import { Logger } from "./Logger.js"

let statSize = 0

function mockFileSystem(data = "") {
  return {
    appendFileSync: vi
      .fn()
      .mockImplementation((fileName: string, data: string) => (statSize += data.length)),
    existsSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(data),
    statSync: vi.fn().mockImplementation(() => ({ size: statSize })),
    writeFileSync: vi.fn(),
  }
}

describe("CSVLogger", () => {
  beforeEach(() => {
    statSize = 0
  })

  describe("append()", () => {
    it("should write a title line with all field names of the given object", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: "abc", other: "xyz" })
      expect(fs.appendFileSync.mock.calls[0]).toEqual(["test.csv", "test,other\n"])
    })

    it("should not write additional fields of subsequent objects", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: "abc", other: "xyz" })
      statSize = 1
      file.append({ different: "123" })
      expect(fs.appendFileSync.mock.calls[2]).toEqual(["test.csv", ",\n"])
    })

    it("should escape double quotes properly", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: 'abc"xyz' })
      expect(fs.appendFileSync.mock.calls[1]).toEqual(["test.csv", 'abc""xyz\n'])
    })

    it("should escape commas properly", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: 'abc"xyz' })
      expect(fs.appendFileSync.mock.calls[1]).toEqual(["test.csv", 'abc""xyz\n'])
    })

    it("should escape newline characters properly", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: "abc\nxyz" })
      expect(fs.appendFileSync.mock.calls[1]).toEqual(["test.csv", '"abc\\nxyz"\n'])
    })

    it("should log numerical zeros as such", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      file.append({ test: 0 })
      expect(fs.appendFileSync.mock.calls[1]).toEqual(["test.csv", "0\n"])
    })
  })

  describe("read", () => {
    it("should read the given file as an array of objects", () => {
      const fs = mockFileSystem(`test,other\n"abc",def\n123,456\n`)
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      expect(file.read()).toEqual([
        { test: "abc", other: "def" },
        { test: "123", other: "456" },
      ])
    })

    it("should unescape all characters properly", () => {
      const csv = `test,other\n"123""abc",def\nghi,\n"uvw\\nx,yz",456\n`
      const fs = mockFileSystem(csv)
      const file = CSVLogger("test.csv")
      file.injectFileSystem(fs)
      expect(file.read()).toEqual([
        { test: '123"abc', other: "def" },
        { test: "ghi", other: "" },
        { test: "uvw\nx,yz", other: "456" },
      ])
    })
  })

  describe("getTransport", () => {
    it("should return a function which can be used to log in csv format", () => {
      const fs = mockFileSystem()
      const file = CSVLogger("test.csv", ["level", "message", "test"])
      file.injectFileSystem(fs)
      const logger = Logger()
      logger.setTransport(file.getTransport())
      logger.debug("abc")
      logger.info({ message: "def" })
      logger.warn({ message: "ghi", test: 1 })
      logger.error({ message: "jkl", unknown: "mno" })
      expect(fs.appendFileSync.mock.calls).toEqual([
        ["test.csv", `level,message,test\n`],
        ["test.csv", `debug,abc,\n`],
        ["test.csv", `info,def,\n`],
        ["test.csv", `warn,ghi,1\n`],
        ["test.csv", `error,jkl,\n`],
      ])
    })
  })
})

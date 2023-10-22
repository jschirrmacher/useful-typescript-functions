import { beforeEach, describe, expect, it, vi } from "vitest"
import { Files, getPreviewFolder } from "./Files"

const hexToBuffer = (hex: string) =>
  new Uint8Array(hex.match(/.{2}/g)?.map(hexPair => parseInt(hexPair, 16)) || [])

export const jpg = hexToBuffer(
  "ffd8ffdb004300" +
    "01".repeat(64) +
    "ffc2000b080001000101011100ffc400140001" +
    "00".repeat(15) +
    "03ffda00080101000000013Fffd9",
)

function mockFs() {
  return {
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  }
}

function sharp() {
  const instance = {
    resize() {
      return instance
    },
    toBuffer() {
      return Promise.resolve(Buffer.alloc(1))
    },
  }
  return instance
}

describe("FileHelper", () => {
  describe("mkdirp()", () => {
    const fs = mockFs()
    const { mkdirp } = Files({ fs })

    it("should call fs.mkdir() with 'recursive=true'", () => {
      mkdirp("test/abc")
      expect(fs.mkdir).toBeCalledWith("test/abc", expect.objectContaining({ recursive: true }))
    })
  })

  describe("getProjectDir()", () => {
    const fs = mockFs()
    const { getProjectDir } = Files({ fs })

    beforeEach(() => {
      delete process.env.TEST
    })

    it("should use the environment variable", async () => {
      process.env.TEST = "/abc"
      expect(await getProjectDir("TEST", "def")).toEqual("/abc")
    })

    it("should fall back to the given path", async () => {
      expect(await getProjectDir("TEST", "def")).toEqual(process.cwd() + "/def")
    })

    it("should create the folder if it doesn't exist", async () => {
      await getProjectDir("TEST", "ghi")
      expect(fs.mkdir).toBeCalledWith(process.cwd() + "/ghi", { recursive: true })
    })
  })

  describe("getPreview()", () => {
    const fs = mockFs()
    const { getPreview } = Files({ fs, sharp })

    fs.readFile.mockImplementation((name: string) => {
      if (name.match(/\/preview_/)) {
        throw `${name} not found`
      } else {
        return jpg
      }
    })

    it("should create a preview if it doesn't yet exist", async () => {
      await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", { width: 20 }),
        expect(fs.writeFile).toBeCalledWith(
          "/tmp/gallery/preview_20/123_file-1.jpg",
          expect.any(Buffer),
          "binary",
        )
    })

    it("should return a newly created preview image", async () => {
      const preview = await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", {
        width: 20,
      })
      expect(preview).toMatch(/^data:image\/jpg;base64,/)
    })

    it("should return an existing preview image", async () => {
      fs.readFile.mockResolvedValue(jpg)
      const preview = await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", {
        width: 20,
      })
      expect(preview).toMatch(/^data:image\/jpg;base64,/)
    })
  })

  describe("getPreviewFolder()", () => {
    it("should return a folder matching the options", async () => {
      expect(getPreviewFolder({ width: 20 })).toEqual("preview_20")
      expect(getPreviewFolder({ height: 40 })).toEqual("preview_40")
      expect(getPreviewFolder({ width: 30, height: 40 })).toEqual("preview_40_30")
      expect(getPreviewFolder({ width: 30, fit: "inside" })).toEqual("preview_inside_30")
    })
  })

  describe("readJSON", () => {
    const testData: [string, Date][] = [
      ["2023-10-22T09:20:00.123Z", new Date("2023-10-22T09:20:00.123Z")],
      ["2023-10-22T11:20:00.123+02:00", new Date("2023-10-22T09:20:00.123Z")],
      ["2023-10-22T11:20:00.123", new Date("2023-10-22T09:20:00.123Z")],
      ["2023-10-22T09:20:00Z", new Date("2023-10-22T09:20Z")],
      ["2023-10-22T09:20Z", new Date("2023-10-22T09:20Z")],
    ]
    testData.forEach(([dateString, expected]) => {
      it(`should parse "${dateString}" to ${expected.toISOString()}`, async () => {
        const fs = mockFs()
        fs.readFile.mockResolvedValue(JSON.stringify({ value: dateString }))
        const { readJSON } = Files({ fs })
        expect(await readJSON("test.json")).toEqual({ value: expected })
      })
    })
  })
})

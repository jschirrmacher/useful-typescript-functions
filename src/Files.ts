import origFs from "fs/promises"
import { resolve, join } from "path"

type FileSystem = Pick<typeof origFs, "readFile" | "writeFile" | "mkdir">

type SizeOptions = {
  width?: number
  height?: number
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  position?:
    | "top"
    | "right top"
    | "right"
    | "right bottom"
    | "bottom"
    | "left bottom"
    | "left"
    | "left top"
}
type SharpOperations = {
  resize(options: SizeOptions): SharpOperations
  toBuffer(): Promise<Buffer>
}
export type SharpLib = (path: string) => SharpOperations

const allowedSizeOptions = ["width", "height", "fit", "position", "kernel"] as const
const isoDatePattern =
  /([T\s](([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)?(\15([0-5]\d))?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?/

export function getPreviewFolder(options: SizeOptions) {
  return (
    "preview_" +
    Object.keys(options)
      .filter(k => allowedSizeOptions.includes(k as (typeof allowedSizeOptions)[number]))
      .sort((a, b) => a.localeCompare(b))
      .map(k => options[k as keyof SizeOptions])
      .join("_")
      .replace(/\s+/g, "-")
  )
}

export function Files({ sharp, fs }: { sharp?: SharpLib; fs?: FileSystem } = {}) {
  const { mkdir, readFile, writeFile } = fs || origFs

  const helper = {
    async mkdirp(path: string) {
      await mkdir(path, { recursive: true })
    },

    async getProjectDir(envName: string, ...path: string[]) {
      const resolved = process.env[envName] || resolve(process.cwd(), ...path)
      await helper.mkdirp(resolved)
      return resolved
    },

    getDataUrl(mimetype: string, data: Buffer) {
      return "data:" + mimetype + ";base64," + data.toString("base64")
    },

    async getPreview(folder: string, name: string, mimetype: string, options: SizeOptions) {
      const previewFolder = getPreviewFolder(options)
      await helper.mkdirp(join(folder, previewFolder))
      const previewFileName = join(folder, previewFolder, name)
      try {
        return helper.getDataUrl(mimetype, await readFile(previewFileName))
      } catch (error) {
        if (sharp) {
          const data = await sharp(join(folder, name)).resize(options).toBuffer()
          writeFile(previewFileName, data, "binary")
          return helper.getDataUrl(mimetype, data)
        }
        return undefined
      }
    },

    async readJSON(fileWithPath: string) {
      const content = await readFile(fileWithPath)
      return JSON.parse(content.toString(), (_, value) => {
        if (typeof value === "string" && value.match(isoDatePattern)) {
          return new Date(value)
        }
        return value
      })
    },
  }

  return helper
}

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
  /(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

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

  const files = {
    async mkdirp(path: string) {
      await mkdir(path, { recursive: true })
    },

    async getProjectDir(envName: string, ...path: string[]) {
      const resolved = process.env[envName] || resolve(process.cwd(), ...path)
      await files.mkdirp(resolved)
      return resolved
    },

    getDataUrl(mimetype: string, data: Buffer) {
      return "data:" + mimetype + ";base64," + data.toString("base64")
    },

    async getPreview(folder: string, name: string, mimetype: string, options: SizeOptions) {
      const previewFolder = getPreviewFolder(options)
      await files.mkdirp(join(folder, previewFolder))
      const previewFileName = join(folder, previewFolder, name)
      try {
        return files.getDataUrl(mimetype, await readFile(previewFileName))
      } catch (error) {
        if (sharp) {
          const data = await sharp(join(folder, name)).resize(options).toBuffer()
          await writeFile(previewFileName, data, "binary")
          return files.getDataUrl(mimetype, data)
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

    async readYAML<T>(fileWithPath: string) {
      const yaml = (await import("yamljs")).default
      try {
        return yaml.parse((await readFile(fileWithPath, { encoding: "utf-8" })).toString()) as T
      } catch (error) {
        throw error
      }
    },

    /**
     * Read YAML configuration file.
     * 
     * @param fileWithPath Path and name of configuration file in YAML format
     * @param withoutSecrets deletes a possibly existing `secrets` entry, defaults to true
     * @returns 
     */
    async readConfig<T>(fileWithPath: string, withoutSecrets = true) {
      try {
        const config = await files.readYAML(fileWithPath)
        if (withoutSecrets) {
          delete (config as { secrets: unknown }).secrets
        }
        return config as T
      } catch (error) {
        if ((error as { code: string }).code === "ENOENT") {
          return { isDefault: true }
        }
        throw error
      }
    },
  }

  return files
}

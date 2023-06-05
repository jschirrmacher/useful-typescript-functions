import fs from "fs"
import { LogStruct } from "./Logger"

export type FileSystem = Pick<
  typeof fs,
  "appendFileSync" | "existsSync" | "readFileSync" | "statSync" | "writeFileSync"
>

function objectMapper(headers: string[]) {
  return (values: string[]) =>
    Object.assign({}, ...headers.map((value, index) => ({ [value]: values[index] })))
}

function escape(value: string) {
  if (value.indexOf("\n") >= 0) {
    value = value.replace(/\n/g, "\\n")
  }
  if (value.indexOf(",") >= 0 || value.indexOf("\\") >= 0) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value.replace(/"/g, '""')
}

function unescape(value: string) {
  if (value.match(/^".*"$/)) {
    return value.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n")
  }
  return value
}

export function CSVLogger(fileName: string, fields = [] as string[]) {
  let { appendFileSync, existsSync, readFileSync, statSync, writeFileSync }: FileSystem = fs

  function writeLine(data: string[]) {
    appendFileSync(fileName, data.map(escape).join(",") + "\n")
  }

  return {
    read() {
      function splitValues(line: string) {
        const rawFields = line.matchAll(/(?<=^|,)(\"(?:[^\"]|\"\")*\"|[^,]*)/g)
        const values = [...rawFields].map(m => unescape(m[0]))
        return values
      }

      const lines = readFileSync(fileName).toString().split("\n")
      const firstLine = lines.shift()
      if (!firstLine) {
        throw new Error("File doesn't contain a header line!")
      }
      firstLine
        .split(",")
        .map(unescape)
        .forEach(field => fields.push(field))
      const toObject = objectMapper(fields)
      return lines
        .filter(line => line.trim())
        .map(splitValues)
        .map(toObject)
    },

    append(data: Record<string, unknown>) {
      if (!existsSync(fileName)) {
        writeFileSync(fileName, "")
      }
      if (!fields.length) {
        Object.keys(data).forEach(field => fields.push(field))
      }
      if (!statSync(fileName).size) {
        writeLine(fields)
      }
      writeLine(fields.map(field => "" + (data[field] || "")))
    },

    getTransport() {
      return (data: LogStruct) => this.append(data)
    },

    injectFileSystem(fileSystem: FileSystem) {
      appendFileSync = fileSystem.appendFileSync
      existsSync = fileSystem.existsSync
      readFileSync = fileSystem.readFileSync
      statSync = fileSystem.statSync
      writeFileSync = fileSystem.writeFileSync
    },
  }
}

export default  CSVLogger

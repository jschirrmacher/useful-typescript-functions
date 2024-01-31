import { PathLike, createReadStream } from "fs"
import { Readable, Transform } from "stream"
import { createLineTransform } from "./LineTransform.js"

interface CSVSourceOptions {
  readStream?: Readable
  path?: PathLike
  separator?: string
  fields?: string[]
}

export function createCSVSource<T>(options: CSVSourceOptions) {
  const actualOptions = Object.assign({ separator: ",", fields: [] }, options)
  if (!actualOptions.readStream) {
    if (!actualOptions.path) {
      throw new Error(`Either 'path' or 'readStream' is required as options in createCSVSource()`)
    }
    actualOptions.readStream = createReadStream(actualOptions.path)
  }
  const { readStream, separator, fields } = actualOptions
  const stream = new Readable({ objectMode: true, read() {} })

  return {
    stream,
    run() {
      readStream
        .pipe(createLineTransform())
        .pipe(createCSVTransform(separator, fields))
        .on("data", message => stream.push(message as T))
        .on("end", () => stream.push(null))
      return this
    },
  }
}

function createCSVTransform(separator = ",", fields: string[] = []) {
  let firstLine = true
  let mapping: number[]
  return new Transform({
    objectMode: true,
    transform(line: string, encoding, callback) {
      const values = splitCSVValues(line, separator)
      if (firstLine) {
        if (fields.length < 1) {
          if (values.length < 1) {
            throw new Error(
              `No idea which fields to read because neither first line contains a list of fields, nor the fields are explicitly set by the CSVSourceOption 'fields'`,
            )
          }
          fields = values
        }
        mapping = fields.map(field => values.findIndex(val => val === field))
        firstLine = false
      } else {
        this.push(Object.fromEntries(fields.map((field, index) => [field, values[mapping[index]]])))
      }
      callback()
    },
  })
}

function splitCSVValues(line: string, separator: string) {
  function unescape(value: string) {
    if (value.match(/^".*"$/)) {
      return value.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n")
    }
    return value.trim()
  }

  const pattern = new RegExp(`(?<=^|${separator})(\"(?:[^\"]|\"\")*\"|[^${separator}]*)`, "g")
  const rawFields = line.matchAll(pattern)
  const values = [...rawFields].map(m => unescape(m[0]))
  return values
}

/**
 * Create a Transform that converts CSV lines to objects.
 * @deprecated Use CSVSource instead
 *
 * @param separator optional separator, defaults to ',' if not specified.
 * @param fields optional list of fields. If not set, it takes the first line in the stream as the field names.
 * @returns the new Transform
 */
export const createCSV2ObjectTransform = createCSVTransform

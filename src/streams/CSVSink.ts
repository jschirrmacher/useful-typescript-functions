import { PathLike, createWriteStream } from "fs"
import { Transform, Writable } from "stream"

interface CSVSinkOptions {
  writeStream?: Writable
  path?: PathLike
  separator?: string
  fields?: string[]
}

export function createCSVSink(options: CSVSinkOptions) {
  const { separator, writeStream, path } = Object.assign({ separator: "," }, options)
  if (!writeStream && !path) {
    throw new Error(`Neither 'writeStream' nor 'path' are specified in the CSVSinkOptions`)
  }
  let headerWritten = false
  const outputStream = writeStream || createWriteStream(path!)
  let fields = options.fields

  return new Writable({
    objectMode: true,
    write(obj: Record<string, unknown>, encoding, done) {
      if (!headerWritten) {
        if (!fields) {
          fields = Object.keys(obj)
        }
        outputStream.write(
          fields.map(field => escapeCSVValue(field, separator)).join(separator) + "\n",
        )
        headerWritten = true
      }
      outputStream.write(
        fields!
          .map(extractValue(obj))
          .map(value => escapeCSVValue(value, separator))
          .join(separator) + "\n",
      )

      done()
    },
  })
}

function extractValue(object: Record<string, unknown>) {
  return function (field: string) {
    if (object[field] === 0) {
      return "0"
    } else if (object[field] instanceof Date) {
      return (object[field] as Date).toISOString()
    }
    return "" + (object[field] || "")
  }
}

function escapeCSVValue(value: string, separator = ",") {
  if (value.indexOf("\n") >= 0) {
    value = value.replace(/\n/g, "\\n")
  }
  if (value.indexOf(separator) >= 0 || value.indexOf("\\") >= 0) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value.replace(/"/g, '""')
}

/**
 * Creates a Transform to create CSV lines from objects.
 * @deprecated Use `createCSVSink()` instead.
 *
 * @param separator can be specified to use another field separator than the standard ','
 * @param predefinedFields optionally specify the fields to read from. If omitted, uses all fields from the first object in the stream.
 * @returns the new Transform
 */
export function createObject2CSVTransform(separator = ",", predefinedFields?: string[]) {
  let fields = undefined as string[] | undefined
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(object: Record<string, unknown>, encoding, callback) {
      if (!fields) {
        fields = predefinedFields || Object.keys(object)
        this.push(fields.map(field => escapeCSVValue(field, separator)).join(separator) + "\n")
      }
      this.push(
        fields
          .map(extractValue(object))
          .map(value => escapeCSVValue(value, separator))
          .join(separator) + "\n",
      )
      callback()
    },
  })
}

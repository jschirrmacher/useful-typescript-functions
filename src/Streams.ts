import { Readable, Transform, Writable } from "stream"

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

function escapeCSVValue(value: string, separator = ",") {
  if (value.indexOf("\n") >= 0) {
    value = value.replace(/\n/g, "\\n")
  }
  if (value.indexOf(separator) >= 0 || value.indexOf("\\") >= 0) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value.replace(/"/g, '""')
}

export function createLineTransform() {
  let buffer = ""
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk: Buffer, encoding, callback) {
      const lines = (buffer + chunk).toString().split("\n")
      buffer = lines.pop() || ""
      lines.forEach(line => {
        if (line.trim() !== "") {
          this.push(line.trim())
        }
      })
      callback()
    },

    flush(callback) {
      if (buffer.trim() !== "") {
        this.push(buffer.trim())
      }
      this.push(null)
      buffer = ""
      callback()
    },
  })
}

export function createJSONL2ObjectTransform() {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(line: string, encoding, callback) {
      this.push(JSON.parse(line))
      callback()
    },
  })
}

export function createObjectToJSONLTransform() {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(object: Record<string, unknown>, encoding, callback) {
      this.push(JSON.stringify(object) + "\n")
      callback()
    },
  })
}

export function createCSV2ObjectTransform(separator = ",", fields?: string[]) {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(line: string, encoding, callback) {
      const values = splitCSVValues(line, separator)
      if (!fields) {
        fields = values
      } else {
        const obj = Object.fromEntries(fields.map((field, index) => [field, values[index]]))
        this.push(obj)
      }
      callback()
    },
  })
}

export function createObject2CSVTransform(separator = ",", predefinedFields?: string[]) {
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

export function createArraySink<T>(sink: T[]) {
  return new Writable({
    objectMode: true,
    write(chunk: T, encoding, callback) {
      sink.push(chunk)
      callback()
    },
  })
}

export async function streamToArray<T>(writable: Readable): Promise<T[]> {
  const result = [] as T[]
  return new Promise((resolve, reject) => {
    writable
      .pipe(createArraySink(result))
      .on("close", () => resolve(result))
      .on("error", reject)
  })
}

export function createObjectStream() {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk: Buffer, encoding, callback) {
      this.push(chunk)
      callback()
    },
  })
}

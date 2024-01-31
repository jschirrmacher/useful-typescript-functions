import { PathLike, createWriteStream } from "fs"
import { Transform, Writable } from "stream"

interface JSONLSinkOptions {
  writeStream?: Writable
  path?: PathLike
}

export function createJSONLSink(options: JSONLSinkOptions) {
  const { writeStream, path } = options
  const outputStream = writeStream || createWriteStream(path!)

  return new Writable({
    objectMode: true,

    write(obj: Record<string, unknown>, encoding, callback) {
      outputStream.write(JSON.stringify(obj) + "\n")
      callback()
    },
  })
}

/**
 * Creates a Transform to create JSON lines from objects.
 * @deprecated Use `createJSONLSink()` instead.
 *
 * @returns the new Transform
 */
export function createObjectToJSONLTransform() {
  return new Transform({
    objectMode: true,
    transform(object: Record<string, unknown>, encoding, callback) {
      this.push(JSON.stringify(object) + "\n")
      callback()
    },
  })
}

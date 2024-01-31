import { PathLike, createReadStream } from "fs"
import { Readable } from "stream"
import { createLineTransform } from "./LineTransform.js"

interface JSONLSourceOptions {
  readStream?: Readable
  path?: PathLike
}

export function createJSONLSource<T>(options: JSONLSourceOptions) {
  const actualOptions = Object.assign({ separator: ",", fields: [] }, options)
  if (!actualOptions.readStream) {
    if (!actualOptions.path) {
      throw new Error(`Either 'path' or 'readStream' is required as options in createJSONLSource()`)
    }
    actualOptions.readStream = createReadStream(actualOptions.path)
  }
  const { readStream } = actualOptions
  const stream = new Readable({ objectMode: true, read() {} })

  return {
    stream,
    run() {
      readStream
        .pipe(createLineTransform())
        .map(line => JSON.parse(line))
        .on("data", message => stream.push(message as T))
        .on("end", () => stream.push(null))
      return this
    },
  }
}

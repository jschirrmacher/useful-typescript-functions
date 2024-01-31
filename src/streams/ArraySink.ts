import { Readable, Writable } from "stream"

export function createArraySink<T>(sink: T[]) {
  return new Writable({
    objectMode: true,
    write(chunk: T, encoding, callback) {
      sink.push(chunk)
      callback()
    },
  })
}

export async function streamToArray<T>(readable: Readable): Promise<T[]> {
  const result = [] as T[]
  return new Promise((resolve, reject) => {
    readable
      .pipe(createArraySink(result))
      .on("close", () => resolve(result))
      .on("error", reject)
  })
}

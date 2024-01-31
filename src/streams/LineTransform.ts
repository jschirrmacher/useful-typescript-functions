import { Transform } from "stream"

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

import { createCSVSink, createJSONLSink } from "./Streams.js"
import { Writable } from "stream"

export type LogLevel = "debug" | "info" | "warn" | "error"

type LogEntry = {
  level?: LogLevel
  message?: string | RegExp
  [key: string]: unknown
}

type EntryStore = { expected: LogEntry[]; unexpected: LogEntry[] }
type Logger = ReturnType<typeof Logger>
export interface LogStruct {
  level: LogLevel
  message: string
  [key: string]: unknown
}
export type Transport = (data: LogStruct) => void
const consoleTransport = ((data: LogStruct) =>
  console[data.level](JSON.stringify(data))) as Transport

function createFileTransport(stream: Writable) {
  return (data: LogStruct) => {
    const { level, message, ...meta } = data
    stream.write({ level, message, meta: JSON.stringify(meta) })
  }
}

export function createCSVTransport(path: string) {
  return createFileTransport(createCSVSink({ fields: ["level", "message", "meta"], path }))
}

export function createJSONLTransport(path: string) {
  return createFileTransport(createJSONLSink({ path }))
}

interface MatcherState {
  equals(a: unknown, b: unknown, customTesters?: [], strictCheck?: boolean): boolean
}
interface ExtendableExpect {
  extend(params: object): void
}

const logPrintLevel = {
  error: ["error"],
  warn: ["error", "warn"],
  info: ["error", "warn", "info"],
  debug: ["error", "warn", "info", "debug"],
}

export function Logger() {
  const options = {
    silent: false,
    globalData: {},
    transport: consoleTransport,
    logLevel: "info" as LogLevel,
  }

  const entries: EntryStore = { expected: [], unexpected: [] }

  function stringify(entries: EntryStore) {
    const format = (prefix: string) => (entry: LogEntry) =>
      `- ${prefix}: ${entry.level?.toUpperCase()} "${entry.message}"`
    const result = [
      ...entries.expected.map(format("unfulfilled")),
      ...entries.unexpected.map(format("unexpected")),
    ]
    return result.join("\n")
  }

  function toLogAsExpected(this: MatcherState, received: Logger) {
    const expected = { expected: [], unexpected: [] }
    const pass = this.equals(received.entries, expected)
    return {
      pass,
      message: () => `Log result\n${stringify(received.entries)}`,
      actual: received.entries,
      expected,
    }
  }

  function compareWith(actual: LogEntry) {
    return function (expected: LogEntry) {
      const { message, ...rest } = expected
      const matcher =
        message instanceof RegExp ? message : { test: (actual: string) => message === actual }
      return (
        matcher.test(actual.message as string) &&
        Object.entries(rest).every(([key, val]) => val === actual[key])
      )
    }
  }

  function log(level: LogLevel, data: string | object) {
    const message = typeof data === "string" ? data : (data as { message: string }).message
    const info = typeof data === "string" ? {} : data
    const entry = { level, ...options.globalData, ...info, message } as LogStruct
    const index = entries.expected.findIndex(compareWith(entry))
    if (index >= 0) {
      entries.expected = entries.expected.filter((_, i) => i !== index)
    } else {
      entries.unexpected.push(entry)
    }
    options.silent || (logPrintLevel[options.logLevel].includes(level) && options.transport(entry))
  }

  return {
    entries,

    debug: (data: string | object) => log("debug", data),
    info: (data: string | object) => log("info", data),
    warn: (data: string | object) => log("warn", data),
    error: (data: string | object) => log("error", data),

    setLogLevel(level: LogLevel) {
      options.logLevel = level
    },

    setSilent(silent: boolean) {
      options.silent = silent
    },

    setTransport(transport: Transport) {
      options.transport = transport
      return this
    },

    setGlobal(data: object) {
      options.globalData = data
      return this
    },

    runInTest(expect: ExtendableExpect) {
      expect.extend({ toLogAsExpected })
      options.silent = true
      entries.expected.length = 0
      entries.unexpected.length = 0
      return this
    },

    expect(info: LogEntry) {
      entries.expected.push(info)
      return this
    },
  }
}

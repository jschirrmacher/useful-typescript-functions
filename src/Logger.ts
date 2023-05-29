export type LogLevel = "debug" | "info" | "warn" | "error"

type LogEntry = {
  level?: LogLevel
  message?: string | RegExp
  [key: string]: unknown
}

type EntryStore = { expected: LogEntry[]; unexpected: LogEntry[] }
type Logger = ReturnType<typeof Logger>
interface MatcherState {
  equals(a: unknown, b: unknown, customTesters?: [], strictCheck?: boolean): boolean
}
interface ExtendableExpect {
  extend(params: object): void
}

export function Logger() {
  const options = {
    silent: false,
    globalData: {},
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
      const regExp = message instanceof RegExp ? message : new RegExp(message as string)
      return (
        regExp.test(actual.message as string) &&
        Object.entries(rest).every(([key, val]) => val === actual[key])
      )
    }
  }

  function log(level: LogLevel, data: string | object) {
    const message = typeof data === "string" ? data : (data as { message: string }).message
    const info = typeof data === "string" ? {} : data
    const entry = { level, message, ...info, ...options.globalData } as LogEntry
    const index = entries.expected.findIndex(compareWith(entry))
    if (index >= 0) {
      entries.expected = entries.expected.filter((_, i) => i !== index)
    } else {
      entries.unexpected.push(entry)
    }
    options.silent || console[level](JSON.stringify(entry))
  }

  return {
    entries,

    debug: (data: string | object) => log("debug", data),
    info: (data: string | object) => log("info", data),
    warn: (data: string | object) => log("warn", data),
    error: (data: string | object) => log("error", data),

    setGlobal(data: object) {
      options.globalData = data
    },

    runInTest(expect: ExtendableExpect) {
      expect.extend({ toLogAsExpected })
      options.silent = true
      entries.expected.length = 0
      entries.unexpected.length = 0
    },

    expect(info: LogEntry) {
      entries.expected.push(info)
    },
  }
}

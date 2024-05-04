import { beforeEach, describe, it, expect, vi } from "vitest"
import { Logger, Transport } from "./Logger"
import "./vitest"

const logger = Logger()

describe("Logger", () => {
  beforeEach(() => {
    logger.runInTest(expect)
    logger.setLogLevel("info")
  })

  it("should log the message if it is a string", () => {
    logger.debug("test")
    expect(logger.entries.unexpected).toContainEqual(expect.objectContaining({ message: "test" }))
  })

  it("should log the message if it is an object", () => {
    logger.debug({ test: "abc" })
    expect(logger.entries.unexpected).toContainEqual(expect.objectContaining({ test: "abc" }))
  })

  it("should log the log level", () => {
    logger.debug("test")
    expect(logger.entries.unexpected).toContainEqual(expect.objectContaining({ level: "debug" }))
  })

  it("should log global data", () => {
    logger.setGlobal({ scope: "global" })
    logger.warn("test")
    expect(logger.entries.unexpected).toContainEqual(
      expect.objectContaining({ scope: "global", message: "test" }),
    )
  })

  it("should allow to check for expected logs to occur", () => {
    logger.expect({ level: "info", message: "test message", test: "Logger", data: 42 })
    logger.info({ message: "test message", test: "Logger", data: 42 })
    expect(logger).toLogAsExpected()
  })

  it.fails("should fail tests if an unexpected log entry ocurred", () => {
    logger.info({ message: "test message", test: "Logger", data: 42 })
    expect(logger).toLogAsExpected()
  })

  it.fails("should fail tests if an expected log message didn't occur", () => {
    logger.expect({ level: "info", message: "test message", test: "Logger", data: 42 })
    expect(logger).toLogAsExpected()
  })

  it("should work with brackets in the expected message", () => {
    logger.expect({ level: "info", message: "text with (brackets)" })
    logger.info("text with (brackets)")
    expect(logger).toLogAsExpected()
  })

  it("should suppress logs with lower log level", () => {
    logger.expect({ level: "info", message: "This is only informative" })
    logger.expect({ level: "error", message: "This should be logged" })
    logger.setLogLevel("error")
    logger.setSilent(false)
    const transport = vi.fn()
    logger.setTransport(transport as Transport)
    logger.info("This is only informative")
    logger.error("This should be logged")
    expect(transport).toBeCalledTimes(1)
    expect(transport.mock.calls).toEqual([
      [expect.objectContaining({ level: "error", message: "This should be logged" })],
    ])
  })

  it("should allow checking log output even if actual output is suppressed due to log level", () => {
    logger.expect({ level: "info", message: "This is only informative" })
    logger.setLogLevel("error")
    logger.info("This is only informative")
    expect(logger).toLogAsExpected()
  })
})

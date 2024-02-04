import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { createKafkaSource, disconnectKafkaSources } from "./KafkaSource.js"
import { Kafka } from "kafkajs"
import { OffsetProvider, startFromTopicEnd, startFromTopicStart } from "./OffsetProvider.js"
import { Logger } from "../Logger.js"
import "../vitest.js"

const logger = Logger()

type MessageHandler = (object: {
  message: {
    value: string
  }
  partition: number
}) => void

let messageHandler: MessageHandler

const consumer = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn((options: { eachMessage: () => void }) => (messageHandler = options.eachMessage)),
  seek: vi.fn(),
  disconnect: vi.fn(),
}

const admin = {
  fetchTopicOffsets: vi.fn().mockResolvedValue([{ partition: 0, offset: "42" }]),
}

const kafka = {
  consumer: vi.fn().mockReturnValue(consumer),
  admin: vi.fn().mockReturnValue(admin),
} as unknown as Kafka

const offsetProvider = {
  getOffset: () => "4711",
  setOffset: vi.fn(),
  getStartPos: () => "checkpoint",
} as OffsetProvider

describe("KafkaSource", async () => {
  beforeEach(() => {
    logger.runInTest(expect)
  })

  afterAll(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    expect(logger).toLogAsExpected()
  })

  it("should read from topic start if requested to", async () => {
    const source = await createKafkaSource(kafka, "test-group", "test-topic", startFromTopicStart)
    await source.run()
    expect(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: true })
    expect(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "0" })
  })

  it("should read from topic end if requested to", async () => {
    const source = await createKafkaSource(kafka, "test-group", "test-topic", startFromTopicEnd)
    await source.run()
    expect(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: false })
    expect(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "42" })
  })

  it("should read from last checkpoint if requested to", async () => {
    const source = await createKafkaSource(kafka, "test-group", "test-topic", offsetProvider)
    await source.run()
    expect(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: false })
    expect(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "4711" })
  })

  it("should disconnect if requested to", async () => {
    await createKafkaSource(kafka, "test-group", "test-topic", offsetProvider)
    await disconnectKafkaSources(logger)
    expect(consumer.disconnect).toBeCalled()
  })

  it("should set new offsets if a message arrives", async () => {
    const source = await createKafkaSource(kafka, "test-group", "test-topic", startFromTopicStart)
    await source.run()
    messageHandler({ partition: 4, message: { value: '"test-message"' } })
    expect(offsetProvider.setOffset).toBeCalledWith(0, "4711")
  })

  it("should resolve after headstart time", async () => {
    vi.useFakeTimers({})
    const source = await createKafkaSource(kafka, "test-group", "test-topic", offsetProvider)
    let resolved = false
    source.runWithHeadstart(100, vi.fn()).finally(() => resolved = true)
    source.stream.emit("data", { test: 42 }) // setup initial timer
    expect(resolved).toBe(false)
    vi.advanceTimersByTime(110)
    await Promise.resolve()
    expect(resolved).toBe(true)
  })

  it("should advance the headstart timer if an event arrives", async () => {
    vi.useFakeTimers({})
    const source = await createKafkaSource(kafka, "test-group", "test-topic", offsetProvider)
    let resolved = false
    source.runWithHeadstart(100, vi.fn()).finally(() => resolved = true)
    source.stream.emit("data", { test: 42 }) // setup initial timer
    vi.advanceTimersByTime(50)
    source.stream.emit("data", { test: 43 }) // send another event to advance timer
    expect(resolved).toBe(false)
    vi.advanceTimersByTime(60)
    await Promise.resolve()
    expect(resolved).toBe(false)
    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(resolved).toBe(true)
  })
})

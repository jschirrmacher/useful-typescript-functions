import type { Consumer, Kafka } from "kafkajs"
import { Readable } from "stream"
import { OffsetProvider } from "./OffsetProvider.js"
import { startFromTopicEnd } from "./OffsetProvider.js"

export type KafkaSource = Awaited<ReturnType<typeof createKafkaSource>>

const consumers: { groupId: string; topic: string; consumer: Consumer }[] = []

/**
 * Create a KafkaSource stream.
 *
 * @param kafka Kafka
 * @param groupId group id of this consumer
 * @param topic the name of the topic to consume
 * @param offsetProvider an OffsetProvider, the default will be an automatically generated one which starts from the current position of the stream
 * @returns
 */
export async function createKafkaSource<T>(
  kafka: Kafka,
  groupId: string,
  topic: string,
  offsetProvider: OffsetProvider = startFromTopicEnd,
) {
  const startPos = offsetProvider.getStartPos()
  const stream = new Readable({ objectMode: true, read() {} })

  const consumer = kafka.consumer({ groupId })
  consumers.push({ groupId, topic, consumer })
  await consumer.connect()
  await consumer.subscribe({ topics: [topic], fromBeginning: startPos === "start" })

  const source = { stream, run, runWithHeadstart }
  return source

  async function run() {
    await consumer.run({
      eachMessage: async ({ message, partition }) => {
        stream.push(JSON.parse(message.value?.toString() as string) as T)
        offsetProvider.setOffset(partition, message.offset)
      },
    })

    const currentOffsets = await kafka.admin().fetchTopicOffsets(topic)

    currentOffsets
      .sort((a, b) => a.partition - b.partition)
      .map(info => info.offset)
      .map((offset, partition) => {
        switch (startPos) {
          case "checkpoint":
            return offsetProvider.getOffset(partition)
          case "current":
            return offset
          case "start":
            return "0"
        }
      })
      .forEach((offset, partition) => {
        consumer.seek({ topic, partition, offset })
        offsetProvider.setOffset(partition, offset)
      })

    return source
  }

  /**
   * Start processing the stream but resolve only after events of the stream ceased to arrive in the specified time.
   * This allows in replay scenarios to first read from a certain stream, and start another only after the first is empty.
   *
   * @param headStartMs Time in milliseconds to resolve the promise after the last event was received in the stream
   * @param processFn processing function for the stream
   * @returns a Promise
   */
  function runWithHeadstart<T>(headStartMs: number, processFn: (data: T) => void) {
    return new Promise(resolve => {
      const resetTimer = startLater(resolve, headStartMs)
      stream
        .on("data", data => {
          processFn(data)
          resetTimer()
        })
        .on("error", console.error)
      run()
    })
  }

  function startLater(func: (...args: unknown[]) => void, afterMs: number) {
    let started = false
    let timer: NodeJS.Timeout
    return function () {
      if (timer) {
        clearTimeout(timer)
      }
      if (!started) {
        timer = setTimeout(() => {
          started = true
          func()
        }, afterMs)
      }
    }
  }
}

export async function disconnectKafkaSources(logger: Pick<typeof console, "info"> = console) {
  await Promise.all(
    consumers.map(async ({ groupId, topic, consumer }) => {
      await consumer.disconnect()
      logger.info(`Kafka connection for group id '${groupId}' on topic '${topic}' closed`)
    }),
  )
}

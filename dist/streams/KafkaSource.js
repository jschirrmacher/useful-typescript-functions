"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectKafkaSources = exports.createKafkaSource = void 0;
const stream_1 = require("stream");
const OffsetProvider_js_1 = require("./OffsetProvider.js");
const consumers = [];
/**
 * Create a KafkaSource stream.
 *
 * @param kafka Kafka
 * @param groupId group id of this consumer
 * @param topic the name of the topic to consume
 * @param offsetProvider an OffsetProvider, the default will be an automatically generated one which starts from the current position of the stream
 * @returns
 */
async function createKafkaSource(kafka, groupId, topic, offsetProvider = OffsetProvider_js_1.startFromTopicEnd) {
    const startPos = offsetProvider.getStartPos();
    const stream = new stream_1.Readable({ objectMode: true, read() { } });
    const consumer = kafka.consumer({ groupId });
    consumers.push({ groupId, topic, consumer });
    await consumer.connect();
    await consumer.subscribe({ topics: [topic], fromBeginning: startPos === "start" });
    const source = { stream, run, runWithHeadstart };
    return source;
    async function run() {
        await consumer.run({
            eachMessage: ({ message, partition }) => {
                stream.push(JSON.parse(message.value?.toString()));
                offsetProvider.setOffset(partition, message.offset);
                return Promise.resolve();
            },
        });
        const currentOffsets = await kafka.admin().fetchTopicOffsets(topic);
        currentOffsets
            .sort((a, b) => a.partition - b.partition)
            .map(info => info.offset)
            .map((offset, partition) => {
            switch (startPos) {
                case "checkpoint":
                    return offsetProvider.getOffset(partition);
                case "current":
                    return offset;
                case "start":
                    return "0";
            }
        })
            .forEach((offset, partition) => {
            consumer.seek({ topic, partition, offset });
            offsetProvider.setOffset(partition, offset);
        });
        return source;
    }
    /**
     * Start processing the stream but resolve only after events of the stream ceased to arrive in the specified time.
     * This allows in replay scenarios to first read from a certain stream, and start another only after the first is empty.
     *
     * @param headStartMs Time in milliseconds to resolve the promise after the last event was received in the stream
     * @param processFn processing function for the stream
     * @returns a Promise
     */
    function runWithHeadstart(headStartMs, processFn) {
        return new Promise(resolve => {
            const resetTimer = startLater(resolve, headStartMs);
            stream
                .on("data", (data) => {
                processFn(data);
                resetTimer();
            })
                .on("error", console.error);
            void run();
        });
    }
    function startLater(func, afterMs) {
        let started = false;
        let timer;
        return function () {
            if (timer) {
                clearTimeout(timer);
            }
            if (!started) {
                timer = setTimeout(() => {
                    started = true;
                    func();
                }, afterMs);
            }
        };
    }
}
exports.createKafkaSource = createKafkaSource;
async function disconnectKafkaSources(logger = console) {
    await Promise.all(consumers.map(async ({ groupId, topic, consumer }) => {
        await consumer.disconnect();
        logger.info(`Kafka connection for group id '${groupId}' on topic '${topic}' closed`);
    }));
}
exports.disconnectKafkaSources = disconnectKafkaSources;
//# sourceMappingURL=KafkaSource.js.map
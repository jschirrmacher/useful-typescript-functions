"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const KafkaSource_js_1 = require("./KafkaSource.js");
const OffsetProvider_js_1 = require("./OffsetProvider.js");
const Logger_js_1 = require("../Logger.js");
require("../vitest.js");
const logger = (0, Logger_js_1.Logger)();
let messageHandler;
const consumer = {
    connect: vitest_1.vi.fn(),
    subscribe: vitest_1.vi.fn(),
    run: vitest_1.vi.fn((options) => (messageHandler = options.eachMessage)),
    seek: vitest_1.vi.fn(),
    disconnect: vitest_1.vi.fn(),
};
const admin = {
    fetchTopicOffsets: vitest_1.vi.fn().mockResolvedValue([{ partition: 0, offset: "42" }]),
};
const kafka = {
    consumer: vitest_1.vi.fn().mockReturnValue(consumer),
    admin: vitest_1.vi.fn().mockReturnValue(admin),
};
const offsetProvider = {
    getOffset: () => "4711",
    setOffset: vitest_1.vi.fn(),
    getStartPos: () => "checkpoint",
};
(0, vitest_1.describe)("KafkaSource", async () => {
    (0, vitest_1.beforeEach)(() => {
        logger.runInTest(vitest_1.expect);
    });
    (0, vitest_1.afterAll)(async () => {
        vitest_1.vi.useRealTimers();
        vitest_1.vi.restoreAllMocks();
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    (0, vitest_1.it)("should read from topic start if requested to", async () => {
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", OffsetProvider_js_1.startFromTopicStart);
        await source.run();
        (0, vitest_1.expect)(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: true });
        (0, vitest_1.expect)(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "0" });
    });
    (0, vitest_1.it)("should read from topic end if requested to", async () => {
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", OffsetProvider_js_1.startFromTopicEnd);
        await source.run();
        (0, vitest_1.expect)(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: false });
        (0, vitest_1.expect)(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "42" });
    });
    (0, vitest_1.it)("should read from last checkpoint if requested to", async () => {
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", offsetProvider);
        await source.run();
        (0, vitest_1.expect)(consumer.subscribe).toBeCalledWith({ topics: ["test-topic"], fromBeginning: false });
        (0, vitest_1.expect)(consumer.seek).toBeCalledWith({ topic: "test-topic", partition: 0, offset: "4711" });
    });
    (0, vitest_1.it)("should disconnect if requested to", async () => {
        await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", offsetProvider);
        await (0, KafkaSource_js_1.disconnectKafkaSources)(logger);
        (0, vitest_1.expect)(consumer.disconnect).toBeCalled();
    });
    (0, vitest_1.it)("should set new offsets if a message arrives", async () => {
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", OffsetProvider_js_1.startFromTopicStart);
        await source.run();
        messageHandler({ partition: 4, message: { value: '"test-message"' } });
        (0, vitest_1.expect)(offsetProvider.setOffset).toBeCalledWith(0, "4711");
    });
    (0, vitest_1.it)("should resolve after headstart time", async () => {
        vitest_1.vi.useFakeTimers({});
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", offsetProvider);
        let resolved = false;
        source.runWithHeadstart(100, vitest_1.vi.fn()).finally(() => resolved = true);
        source.stream.emit("data", { test: 42 }); // setup initial timer
        (0, vitest_1.expect)(resolved).toBe(false);
        vitest_1.vi.advanceTimersByTime(110);
        await Promise.resolve();
        (0, vitest_1.expect)(resolved).toBe(true);
    });
    (0, vitest_1.it)("should advance the headstart timer if an event arrives", async () => {
        vitest_1.vi.useFakeTimers({});
        const source = await (0, KafkaSource_js_1.createKafkaSource)(kafka, "test-group", "test-topic", offsetProvider);
        let resolved = false;
        source.runWithHeadstart(100, vitest_1.vi.fn()).finally(() => resolved = true);
        source.stream.emit("data", { test: 42 }); // setup initial timer
        vitest_1.vi.advanceTimersByTime(50);
        source.stream.emit("data", { test: 43 }); // send another event to advance timer
        (0, vitest_1.expect)(resolved).toBe(false);
        vitest_1.vi.advanceTimersByTime(60);
        await Promise.resolve();
        (0, vitest_1.expect)(resolved).toBe(false);
        vitest_1.vi.advanceTimersByTime(50);
        await Promise.resolve();
        (0, vitest_1.expect)(resolved).toBe(true);
    });
});
//# sourceMappingURL=KafkaSource.test.js.map
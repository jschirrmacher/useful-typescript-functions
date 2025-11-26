"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Logger_1 = require("./Logger");
require("./vitest");
const logger = (0, Logger_1.Logger)();
(0, vitest_1.describe)("Logger", () => {
    (0, vitest_1.beforeEach)(() => {
        logger.runInTest(vitest_1.expect);
        logger.setLogLevel("info");
    });
    (0, vitest_1.it)("should log the message if it is a string", () => {
        logger.debug("test");
        (0, vitest_1.expect)(logger.entries.unexpected).toContainEqual(vitest_1.expect.objectContaining({ message: "test" }));
    });
    (0, vitest_1.it)("should log the message if it is an object", () => {
        logger.debug({ test: "abc" });
        (0, vitest_1.expect)(logger.entries.unexpected).toContainEqual(vitest_1.expect.objectContaining({ test: "abc" }));
    });
    (0, vitest_1.it)("should log the log level", () => {
        logger.debug("test");
        (0, vitest_1.expect)(logger.entries.unexpected).toContainEqual(vitest_1.expect.objectContaining({ level: "debug" }));
    });
    (0, vitest_1.it)("should log global data", () => {
        logger.setGlobal({ scope: "global" });
        logger.warn("test");
        (0, vitest_1.expect)(logger.entries.unexpected).toContainEqual(vitest_1.expect.objectContaining({ scope: "global", message: "test" }));
    });
    (0, vitest_1.it)("should allow to check for expected logs to occur", () => {
        logger.expect({ level: "info", message: "test message", test: "Logger", data: 42 });
        logger.info({ message: "test message", test: "Logger", data: 42 });
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    vitest_1.it.fails("should fail tests if an unexpected log entry ocurred", () => {
        logger.info({ message: "test message", test: "Logger", data: 42 });
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    vitest_1.it.fails("should fail tests if an expected log message didn't occur", () => {
        logger.expect({ level: "info", message: "test message", test: "Logger", data: 42 });
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    (0, vitest_1.it)("should work with brackets in the expected message", () => {
        logger.expect({ level: "info", message: "text with (brackets)" });
        logger.info("text with (brackets)");
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    (0, vitest_1.it)("should suppress logs with lower log level", () => {
        logger.expect({ level: "info", message: "This is only informative" });
        logger.expect({ level: "error", message: "This should be logged" });
        logger.setLogLevel("error");
        logger.setSilent(false);
        const transport = vitest_1.vi.fn();
        logger.setTransport(transport);
        logger.info("This is only informative");
        logger.error("This should be logged");
        (0, vitest_1.expect)(transport).toBeCalledTimes(1);
        (0, vitest_1.expect)(transport.mock.calls).toEqual([
            [vitest_1.expect.objectContaining({ level: "error", message: "This should be logged" })],
        ]);
    });
    (0, vitest_1.it)("should allow checking log output even if actual output is suppressed due to log level", () => {
        logger.expect({ level: "info", message: "This is only informative" });
        logger.setLogLevel("error");
        logger.info("This is only informative");
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
});
//# sourceMappingURL=Logger.test.js.map
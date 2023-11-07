import { createWriteStream } from "fs";
import { createObject2CSVTransform, createObjectToJSONLTransform } from "./Streams.js";
const consoleTransport = ((data) => console[data.level](JSON.stringify(data)));
function createFileTransport(stream, fileName) {
    stream.pipe(createWriteStream(fileName));
    return (data) => {
        const { level, message, ...meta } = data;
        stream.write({ level, message, meta: JSON.stringify(meta) });
    };
}
export function createCSVTransport(fileName) {
    return createFileTransport(createObject2CSVTransform(",", ["level", "message", "meta"]), fileName);
}
export function createJSONLTransport(fileName) {
    return createFileTransport(createObjectToJSONLTransform(), fileName);
}
export function Logger() {
    const options = {
        silent: false,
        globalData: {},
        transport: consoleTransport,
    };
    const entries = { expected: [], unexpected: [] };
    function stringify(entries) {
        const format = (prefix) => (entry) => `- ${prefix}: ${entry.level?.toUpperCase()} "${entry.message}"`;
        const result = [
            ...entries.expected.map(format("unfulfilled")),
            ...entries.unexpected.map(format("unexpected")),
        ];
        return result.join("\n");
    }
    function toLogAsExpected(received) {
        const expected = { expected: [], unexpected: [] };
        const pass = this.equals(received.entries, expected);
        return {
            pass,
            message: () => `Log result\n${stringify(received.entries)}`,
            actual: received.entries,
            expected,
        };
    }
    function compareWith(actual) {
        return function (expected) {
            const { message, ...rest } = expected;
            const matcher = message instanceof RegExp ? message : { test: (actual) => message === actual };
            return (matcher.test(actual.message) &&
                Object.entries(rest).every(([key, val]) => val === actual[key]));
        };
    }
    function log(level, data) {
        const message = typeof data === "string" ? data : data.message;
        const info = typeof data === "string" ? {} : data;
        const entry = { level, ...options.globalData, ...info, message };
        const index = entries.expected.findIndex(compareWith(entry));
        if (index >= 0) {
            entries.expected = entries.expected.filter((_, i) => i !== index);
        }
        else {
            entries.unexpected.push(entry);
        }
        options.silent || options.transport(entry);
    }
    return {
        entries,
        debug: (data) => log("debug", data),
        info: (data) => log("info", data),
        warn: (data) => log("warn", data),
        error: (data) => log("error", data),
        setTransport(transport) {
            options.transport = transport;
            return this;
        },
        setGlobal(data) {
            options.globalData = data;
            return this;
        },
        runInTest(expect) {
            expect.extend({ toLogAsExpected });
            options.silent = true;
            entries.expected.length = 0;
            entries.unexpected.length = 0;
            return this;
        },
        expect(info) {
            entries.expected.push(info);
            return this;
        },
    };
}
//# sourceMappingURL=Logger.js.map
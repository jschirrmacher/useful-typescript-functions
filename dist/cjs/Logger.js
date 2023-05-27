"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
function Logger() {
    const options = {
        silent: false,
        globalData: {},
    };
    const entries = { expected: [], unexpected: [] };
    function toLogAsExpected(received) {
        const expected = { expected: [], unexpected: [] };
        const pass = this.equals(received.entries, expected);
        return {
            pass,
            message: () => `Unexpected log result`,
            actual: received.entries,
            expected,
        };
    }
    function compareWith(actual) {
        return function (expected) {
            const { message, ...rest } = expected;
            const regExp = message instanceof RegExp ? message : new RegExp(message);
            return (regExp.test(actual.message) &&
                Object.entries(rest).every(([key, val]) => val === actual[key]));
        };
    }
    function log(level, data) {
        const message = typeof data === "string" ? data : data.message;
        const info = typeof data === "string" ? {} : data;
        const entry = { level, message, ...info, ...options.globalData };
        const index = entries.expected.findIndex(compareWith(entry));
        if (index >= 0) {
            entries.expected = entries.expected.filter((_, i) => i !== index);
        }
        else {
            entries.unexpected.push(entry);
        }
        options.silent || console[level](JSON.stringify(entry));
    }
    return {
        entries,
        debug: (data) => log("debug", data),
        info: (data) => log("info", data),
        warn: (data) => log("warn", data),
        error: (data) => log("error", data),
        setGlobal(data) {
            options.globalData = data;
        },
        runInTest(expect) {
            expect.extend({ toLogAsExpected });
            options.silent = true;
            entries.expected.length = 0;
            entries.unexpected.length = 0;
        },
        expect(info) {
            entries.expected.push(info);
        },
    };
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map
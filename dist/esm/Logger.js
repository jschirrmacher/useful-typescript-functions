const consoleTransport = ((data) => console[data.level](JSON.stringify(data)));
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
            const regExp = message instanceof RegExp ? message : new RegExp(message);
            return (regExp.test(actual.message) &&
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
        },
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
//# sourceMappingURL=Logger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const JSONLSink_js_1 = require("./JSONLSink.js");
const ArraySink_1 = require("./ArraySink");
(0, vitest_1.it)("should return a sink to generate JSONL from objects", async () => {
    const result = await new Promise((resolve, reject) => {
        const result = [];
        const writeStream = (0, ArraySink_1.createArraySink)(result);
        stream_1.Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }])
            .pipe((0, JSONLSink_js_1.createJSONLSink)({ writeStream }))
            .on("finish", () => resolve(result))
            .on("error", reject);
    });
    (0, vitest_1.expect)(result).toEqual(['{"level":42}\n', '{"area":52}\n', '{"other":"abc"}\n']);
});
//# sourceMappingURL=JSONLSink.test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const Streams_1 = require("../Streams");
const JSONLSource_1 = require("./JSONLSource");
(0, vitest_1.it)("should return a Stream to extract objects in JSONL format from a Readable", async () => {
    (0, vitest_1.expect)(await (0, Streams_1.streamToArray)((0, JSONLSource_1.createJSONLSource)({
        readStream: stream_1.Readable.from(`{"level":42}\n{"area":52}\n\n{"other":"abc"}`),
    }).run().stream)).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }]);
});
//# sourceMappingURL=JSONLSource.test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const Streams_1 = require("./Streams");
(0, vitest_1.describe)("createObjectStream", () => {
    (0, vitest_1.it)("should accept objects", async () => {
        (0, vitest_1.expect)(await (0, Streams_1.streamToArray)(stream_1.Readable.from([{ level: 42 }, { area: 52 }, { other: "abc" }]).pipe((0, Streams_1.createObjectStream)()))).toEqual([{ level: 42 }, { area: 52 }, { other: "abc" }]);
    });
});
//# sourceMappingURL=Streams.test.js.map
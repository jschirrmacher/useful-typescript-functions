"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const CSVSource_1 = require("./CSVSource");
const stream_1 = require("stream");
const ArraySink_1 = require("./ArraySink");
(0, vitest_1.it)("should collect data in the array", async () => {
    const result = [];
    await new Promise(resolve => {
        (0, CSVSource_1.createCSVSource)({ readStream: stream_1.Readable.from(`level,area,other\n42,52,abc`) })
            .run()
            .stream.pipe((0, ArraySink_1.createArraySink)(result))
            .on("close", resolve);
    });
    (0, vitest_1.expect)(result).toEqual([{ level: "42", area: "52", other: "abc" }]);
});
//# sourceMappingURL=ArraySink.test.js.map
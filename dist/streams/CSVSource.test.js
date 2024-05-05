"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const Streams_1 = require("../Streams");
async function createPipeline(input, separator = ",") {
    const pipeline = (0, Streams_1.createCSVSource)({ readStream: stream_1.Readable.from(input), separator }).run();
    return await (0, Streams_1.streamToArray)(pipeline.stream);
}
(0, vitest_1.it)("should return a Source to extract objects from a Readable", async () => {
    (0, vitest_1.expect)(await createPipeline(`level,area,other\n42,52,abc`)).toEqual([
        { level: "42", area: "52", other: "abc" },
    ]);
});
(0, vitest_1.it)("should unescape all characters properly", async () => {
    (0, vitest_1.expect)(await createPipeline(`test,other\n"123""abc",def\nghi,\n"uvw\\nx,yz",456\n`)).toEqual([
        { test: '123"abc', other: "def" },
        { test: "ghi", other: "" },
        { test: "uvw\nx,yz", other: "456" },
    ]);
});
(0, vitest_1.it)("should work with ';' as a separator", async () => {
    (0, vitest_1.expect)(await createPipeline(`test;other\n"123;abc";def\n`, ";")).toEqual([
        { test: "123;abc", other: "def" },
    ]);
});
(0, vitest_1.it)("should work with a predefined list of fields", async () => {
    const pipeline = (0, Streams_1.createCSVSource)({
        readStream: stream_1.Readable.from(`level,area,other,test\n42,52,abc,def`),
        fields: ["test", "area"],
    }).run();
    (0, vitest_1.expect)(await (0, Streams_1.streamToArray)(pipeline.stream)).toEqual([{ area: "52", test: "def" }]);
});
//# sourceMappingURL=CSVSource.test.js.map
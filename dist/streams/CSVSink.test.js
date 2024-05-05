"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const Streams_1 = require("../Streams");
const ArraySink_1 = require("./ArraySink");
function createPipeline(input, separator = ",", fields) {
    return new Promise((resolve, reject) => {
        const result = [];
        const writeStream = (0, ArraySink_1.createArraySink)(result);
        stream_1.Readable.from(input)
            .pipe((0, Streams_1.createCSVSink)({ writeStream, separator, fields }))
            .on("finish", () => resolve(result))
            .on("error", reject);
    });
}
(0, vitest_1.it)("should use all the fields, if not explicitly specified", async () => {
    (0, vitest_1.expect)(await createPipeline([{ level: "42", area: "52" }])).toEqual([
        "level,area\n",
        "42,52\n",
    ]);
});
(0, vitest_1.it)("should use the fields, if specified, in the specified order", async () => {
    (0, vitest_1.expect)(await createPipeline([{ level: "42", area: "52" }], ",", ["area", "level", "other"])).toEqual(["area,level,other\n", "52,42,\n"]);
});
(0, vitest_1.it)("should work with ';' as a separator", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: "123;abc", other: "def" }], ";")).toEqual([
        `test;other\n`,
        `"123;abc";def\n`,
    ]);
});
(0, vitest_1.it)("should emit a title line with all field names of the given object", async () => {
    (0, vitest_1.expect)(await createPipeline([{ level: "42", area: "52", other: "abc" }])).toEqual([
        "level,area,other\n",
        "42,52,abc\n",
    ]);
});
(0, vitest_1.it)("should not write additional fields of subsequent objects", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: "abc", other: "xyz" }, { different: "123" }])).toEqual([
        "test,other\n",
        "abc,xyz\n",
        ",\n",
    ]);
});
(0, vitest_1.it)("should escape double quotes properly", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: 'abc"xyz' }])).toEqual(["test\n", 'abc""xyz\n']);
});
(0, vitest_1.it)("should escape commas properly", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: "abc,xyz" }])).toEqual(["test\n", '"abc,xyz"\n']);
});
(0, vitest_1.it)("should escape newline characters properly", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: "abc\nxyz" }])).toEqual(["test\n", '"abc\\nxyz"\n']);
});
(0, vitest_1.it)("should log numerical zeros as such", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: 0 }])).toEqual(["test\n", "0\n"]);
});
(0, vitest_1.it)("should log dates in ISO 8601 format in UTC", async () => {
    (0, vitest_1.expect)(await createPipeline([{ test: new Date("2023-11-05T20:23Z") }])).toEqual([
        "test\n",
        "2023-11-05T20:23:00.000Z\n",
    ]);
});
//# sourceMappingURL=CSVSink.test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const vitest_1 = require("vitest");
const Streams_js_1 = require("../Streams.js");
const LineTransform_js_1 = require("./LineTransform.js");
(0, vitest_1.describe)("createLineTransform", () => {
    (0, vitest_1.it)("should return a TransformStream to extract lines from a ReadableStream", async () => {
        (0, vitest_1.expect)(await (0, Streams_js_1.streamToArray)(stream_1.Readable.from(`line 1\nline 2\n\nline 3`).pipe((0, LineTransform_js_1.createLineTransform)()))).toEqual(["line 1", "line 2", "line 3"]);
    });
});
//# sourceMappingURL=LineTransform.test.js.map
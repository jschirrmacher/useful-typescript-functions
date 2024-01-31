"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToArray = exports.createArraySink = void 0;
const stream_1 = require("stream");
function createArraySink(sink) {
    return new stream_1.Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            sink.push(chunk);
            callback();
        },
    });
}
exports.createArraySink = createArraySink;
async function streamToArray(readable) {
    const result = [];
    return new Promise((resolve, reject) => {
        readable
            .pipe(createArraySink(result))
            .on("close", () => resolve(result))
            .on("error", reject);
    });
}
exports.streamToArray = streamToArray;
//# sourceMappingURL=ArraySink.js.map
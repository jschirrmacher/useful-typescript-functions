"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObjectToJSONLTransform = exports.createJSONLSink = void 0;
const fs_1 = require("fs");
const stream_1 = require("stream");
function createJSONLSink(options) {
    const { writeStream, path } = options;
    const outputStream = writeStream || (0, fs_1.createWriteStream)(path);
    return new stream_1.Writable({
        objectMode: true,
        write(obj, encoding, callback) {
            outputStream.write(JSON.stringify(obj) + "\n");
            callback();
        },
    });
}
exports.createJSONLSink = createJSONLSink;
/**
 * Creates a Transform to create JSON lines from objects.
 * @deprecated Use `createJSONLSink()` instead.
 *
 * @returns the new Transform
 */
function createObjectToJSONLTransform() {
    return new stream_1.Transform({
        objectMode: true,
        transform(object, encoding, callback) {
            this.push(JSON.stringify(object) + "\n");
            callback();
        },
    });
}
exports.createObjectToJSONLTransform = createObjectToJSONLTransform;
//# sourceMappingURL=JSONLSink.js.map
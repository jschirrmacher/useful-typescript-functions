"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJSONLSource = createJSONLSource;
const fs_1 = require("fs");
const stream_1 = require("stream");
const LineTransform_js_1 = require("./LineTransform.js");
function createJSONLSource(options) {
    const actualOptions = Object.assign({ separator: ",", fields: [] }, options);
    if (!actualOptions.readStream) {
        if (!actualOptions.path) {
            throw new Error(`Either 'path' or 'readStream' is required as options in createJSONLSource()`);
        }
        actualOptions.readStream = (0, fs_1.createReadStream)(actualOptions.path);
    }
    const { readStream } = actualOptions;
    const stream = new stream_1.Readable({ objectMode: true, read() { } });
    return {
        stream,
        run() {
            readStream
                .pipe((0, LineTransform_js_1.createLineTransform)())
                .map(line => JSON.parse(line))
                .on("data", message => stream.push(message))
                .on("end", () => stream.push(null));
            return this;
        },
    };
}
//# sourceMappingURL=JSONLSource.js.map
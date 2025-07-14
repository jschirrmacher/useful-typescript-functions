"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLineTransform = createLineTransform;
const stream_1 = require("stream");
function createLineTransform() {
    let buffer = "";
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, encoding, callback) {
            const lines = (buffer + chunk).toString().split("\n");
            buffer = lines.pop() || "";
            lines.forEach(line => {
                if (line.trim() !== "") {
                    this.push(line.trim());
                }
            });
            callback();
        },
        flush(callback) {
            if (buffer.trim() !== "") {
                this.push(buffer.trim());
            }
            this.push(null);
            buffer = "";
            callback();
        },
    });
}
//# sourceMappingURL=LineTransform.js.map
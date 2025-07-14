"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObjectStream = createObjectStream;
const stream_1 = require("stream");
__exportStar(require("./streams/CSVSink.js"), exports);
__exportStar(require("./streams/CSVSource.js"), exports);
__exportStar(require("./streams/JSONLSink.js"), exports);
__exportStar(require("./streams/JSONLSource.js"), exports);
__exportStar(require("./streams/ArraySink.js"), exports);
__exportStar(require("./streams/DatabaseSink.js"), exports);
__exportStar(require("./streams/KafkaSource.js"), exports);
__exportStar(require("./streams/KeyedState.js"), exports);
__exportStar(require("./streams/LineTransform.js"), exports);
__exportStar(require("./streams/OffsetProvider.js"), exports);
__exportStar(require("./streams/KeyedStateEntity.js"), exports);
__exportStar(require("./streams/KeyedStateMigration.js"), exports);
/**
 * @deprecated use the several sink modules instead.
 */
function createObjectStream() {
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
        },
    });
}
//# sourceMappingURL=Streams.js.map
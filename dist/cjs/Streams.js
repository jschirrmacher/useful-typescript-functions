"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObjectStream = exports.streamToArray = exports.createArraySink = exports.createObject2CSVTransform = exports.createCSV2ObjectTransform = exports.createObjectToJSONLTransform = exports.createJSONL2ObjectTransform = exports.createLineTransform = void 0;
const stream_1 = require("stream");
function splitCSVValues(line, separator) {
    function unescape(value) {
        if (value.match(/^".*"$/)) {
            return value.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n");
        }
        return value;
    }
    const pattern = new RegExp(`(?<=^|${separator})(\"(?:[^\"]|\"\")*\"|[^${separator}]*)`, "g");
    const rawFields = line.matchAll(pattern);
    const values = [...rawFields].map(m => unescape(m[0]));
    return values;
}
function escapeCSVValue(value, separator = ",") {
    if (value.indexOf("\n") >= 0) {
        value = value.replace(/\n/g, "\\n");
    }
    if (value.indexOf(separator) >= 0 || value.indexOf("\\") >= 0) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value.replace(/"/g, '""');
}
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
exports.createLineTransform = createLineTransform;
function createJSONL2ObjectTransform() {
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(line, encoding, callback) {
            this.push(JSON.parse(line));
            callback();
        },
    });
}
exports.createJSONL2ObjectTransform = createJSONL2ObjectTransform;
function createObjectToJSONLTransform() {
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(object, encoding, callback) {
            this.push(JSON.stringify(object) + "\n");
            callback();
        },
    });
}
exports.createObjectToJSONLTransform = createObjectToJSONLTransform;
function createCSV2ObjectTransform(separator = ",", fields) {
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(line, encoding, callback) {
            const values = splitCSVValues(line, separator);
            if (!fields) {
                fields = values;
            }
            else {
                const obj = Object.fromEntries(fields.map((field, index) => [field, values[index]]));
                this.push(obj);
            }
            callback();
        },
    });
}
exports.createCSV2ObjectTransform = createCSV2ObjectTransform;
function createObject2CSVTransform(separator = ",", predefinedFields) {
    function extractValue(object) {
        return function (field) {
            if (object[field] === 0) {
                return "0";
            }
            else if (object[field] instanceof Date) {
                return object[field].toISOString();
            }
            return "" + (object[field] || "");
        };
    }
    let fields = undefined;
    return new stream_1.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(object, encoding, callback) {
            if (!fields) {
                fields = predefinedFields || Object.keys(object);
                this.push(fields.map(field => escapeCSVValue(field, separator)).join(separator) + "\n");
            }
            this.push(fields
                .map(extractValue(object))
                .map(value => escapeCSVValue(value, separator))
                .join(separator) + "\n");
            callback();
        },
    });
}
exports.createObject2CSVTransform = createObject2CSVTransform;
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
async function streamToArray(writable) {
    const result = [];
    return new Promise((resolve, reject) => {
        writable
            .pipe(createArraySink(result))
            .on("close", () => resolve(result))
            .on("error", reject);
    });
}
exports.streamToArray = streamToArray;
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
exports.createObjectStream = createObjectStream;
//# sourceMappingURL=Streams.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObject2CSVTransform = exports.createCSVSink = void 0;
const fs_1 = require("fs");
const stream_1 = require("stream");
function createCSVSink(options) {
    const { separator, writeStream, path } = Object.assign({ separator: "," }, options);
    if (!writeStream && !path) {
        throw new Error(`Neither 'writeStream' nor 'path' are specified in the CSVSinkOptions`);
    }
    let headerWritten = false;
    const outputStream = writeStream || (0, fs_1.createWriteStream)(path);
    let fields = options.fields;
    return new stream_1.Writable({
        objectMode: true,
        write(obj, encoding, done) {
            if (!headerWritten) {
                if (!fields) {
                    fields = Object.keys(obj);
                }
                outputStream.write(fields.map(field => escapeCSVValue(field, separator)).join(separator) + "\n");
                headerWritten = true;
            }
            outputStream.write(fields
                .map(extractValue(obj))
                .map(value => escapeCSVValue(value, separator))
                .join(separator) + "\n");
            done();
        },
    });
}
exports.createCSVSink = createCSVSink;
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
function escapeCSVValue(value, separator = ",") {
    if (value.indexOf("\n") >= 0) {
        value = value.replace(/\n/g, "\\n");
    }
    if (value.indexOf(separator) >= 0 || value.indexOf("\\") >= 0) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value.replace(/"/g, '""');
}
/**
 * Creates a Transform to create CSV lines from objects.
 * @deprecated Use `createCSVSink()` instead.
 *
 * @param separator can be specified to use another field separator than the standard ','
 * @param predefinedFields optionally specify the fields to read from. If omitted, uses all fields from the first object in the stream.
 * @returns the new Transform
 */
function createObject2CSVTransform(separator = ",", predefinedFields) {
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
//# sourceMappingURL=CSVSink.js.map
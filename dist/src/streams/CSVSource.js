"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCSV2ObjectTransform = void 0;
exports.createCSVSource = createCSVSource;
const fs_1 = require("fs");
const stream_1 = require("stream");
const LineTransform_js_1 = require("./LineTransform.js");
function createCSVSource(options) {
    const actualOptions = Object.assign({ separator: ",", fields: [] }, options);
    if (!actualOptions.readStream) {
        if (!actualOptions.path) {
            throw new Error(`Either 'path' or 'readStream' is required as options in createCSVSource()`);
        }
        actualOptions.readStream = (0, fs_1.createReadStream)(actualOptions.path);
    }
    const { readStream, separator, fields } = actualOptions;
    const stream = new stream_1.Readable({ objectMode: true, read() { } });
    return {
        stream,
        run() {
            readStream
                .pipe((0, LineTransform_js_1.createLineTransform)())
                .pipe(createCSVTransform(separator, fields))
                .on("data", message => stream.push(message))
                .on("end", () => stream.push(null));
            return this;
        },
    };
}
function createCSVTransform(separator = ",", fields = []) {
    let firstLine = true;
    let mapping;
    return new stream_1.Transform({
        objectMode: true,
        transform(line, encoding, callback) {
            const values = splitCSVValues(line, separator);
            if (firstLine) {
                if (fields.length < 1) {
                    if (values.length < 1) {
                        throw new Error(`No idea which fields to read because neither first line contains a list of fields, nor the fields are explicitly set by the CSVSourceOption 'fields'`);
                    }
                    fields = values;
                }
                mapping = fields.map(field => values.findIndex(val => val === field));
                firstLine = false;
            }
            else {
                this.push(Object.fromEntries(fields.map((field, index) => [field, values[mapping[index]]])));
            }
            callback();
        },
    });
}
function splitCSVValues(line, separator) {
    function unescape(value) {
        if (value.match(/^".*"$/)) {
            return value.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n");
        }
        return value.trim();
    }
    const pattern = new RegExp(`(?<=^|${separator})(\"(?:[^\"]|\"\")*\"|[^${separator}]*)`, "g");
    const rawFields = line.matchAll(pattern);
    const values = [...rawFields].map(m => unescape(m[0]));
    return values;
}
/**
 * Create a Transform that converts CSV lines to objects.
 * @deprecated Use CSVSource instead
 *
 * @param separator optional separator, defaults to ',' if not specified.
 * @param fields optional list of fields. If not set, it takes the first line in the stream as the field names.
 * @returns the new Transform
 */
exports.createCSV2ObjectTransform = createCSVTransform;
//# sourceMappingURL=CSVSource.js.map
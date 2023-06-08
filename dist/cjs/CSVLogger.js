"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVLogger = void 0;
const fs_1 = __importDefault(require("fs"));
function objectMapper(headers) {
    return (values) => Object.assign({}, ...headers.map((value, index) => ({ [value]: values[index] })));
}
function escape(value) {
    if (value.indexOf("\n") >= 0) {
        value = value.replace(/\n/g, "\\n");
    }
    if (value.indexOf(",") >= 0 || value.indexOf("\\") >= 0) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value.replace(/"/g, '""');
}
function unescape(value) {
    if (value.match(/^".*"$/)) {
        return value.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n");
    }
    return value;
}
function CSVLogger(fileName, fields = []) {
    let { appendFileSync, existsSync, readFileSync, statSync, writeFileSync } = fs_1.default;
    function writeLine(data) {
        appendFileSync(fileName, data.map(escape).join(",") + "\n");
    }
    return {
        read() {
            function splitValues(line) {
                const rawFields = line.matchAll(/(?<=^|,)(\"(?:[^\"]|\"\")*\"|[^,]*)/g);
                const values = [...rawFields].map(m => unescape(m[0]));
                return values;
            }
            const lines = readFileSync(fileName).toString().split("\n");
            const firstLine = lines.shift();
            if (!firstLine) {
                throw new Error("File doesn't contain a header line!");
            }
            firstLine
                .split(",")
                .map(unescape)
                .forEach(field => fields.push(field));
            const toObject = objectMapper(fields);
            return lines
                .filter(line => line.trim())
                .map(splitValues)
                .map(toObject);
        },
        append(data) {
            if (!existsSync(fileName)) {
                writeFileSync(fileName, "");
            }
            if (!fields.length) {
                Object.keys(data).forEach(field => fields.push(field));
            }
            if (!statSync(fileName).size) {
                writeLine(fields);
            }
            writeLine(fields.map(field => (data[field] === 0 ? "0" : "" + (data[field] || ""))));
        },
        getTransport() {
            return (data) => this.append(data);
        },
        injectFileSystem(fileSystem) {
            appendFileSync = fileSystem.appendFileSync;
            existsSync = fileSystem.existsSync;
            readFileSync = fileSystem.readFileSync;
            statSync = fileSystem.statSync;
            writeFileSync = fileSystem.writeFileSync;
        },
    };
}
exports.CSVLogger = CSVLogger;
exports.default = CSVLogger;
//# sourceMappingURL=CSVLogger.js.map
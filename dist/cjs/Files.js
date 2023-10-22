"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = exports.getPreviewFolder = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const allowedSizeOptions = ["width", "height", "fit", "position", "kernel"];
const isoDatePattern = /([T\s](([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)?(\15([0-5]\d))?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?/;
function getPreviewFolder(options) {
    return ("preview_" +
        Object.keys(options)
            .filter(k => allowedSizeOptions.includes(k))
            .sort((a, b) => a.localeCompare(b))
            .map(k => options[k])
            .join("_")
            .replace(/\s+/g, "-"));
}
exports.getPreviewFolder = getPreviewFolder;
function Files({ sharp, fs } = {}) {
    const { mkdir, readFile, writeFile } = fs || promises_1.default;
    const helper = {
        async mkdirp(path) {
            await mkdir(path, { recursive: true });
        },
        async getProjectDir(envName, ...path) {
            const resolved = process.env[envName] || (0, path_1.resolve)(process.cwd(), ...path);
            await helper.mkdirp(resolved);
            return resolved;
        },
        getDataUrl(mimetype, data) {
            return "data:" + mimetype + ";base64," + data.toString("base64");
        },
        async getPreview(folder, name, mimetype, options) {
            const previewFolder = getPreviewFolder(options);
            await helper.mkdirp((0, path_1.join)(folder, previewFolder));
            const previewFileName = (0, path_1.join)(folder, previewFolder, name);
            try {
                return helper.getDataUrl(mimetype, await readFile(previewFileName));
            }
            catch (error) {
                if (sharp) {
                    const data = await sharp((0, path_1.join)(folder, name)).resize(options).toBuffer();
                    writeFile(previewFileName, data, "binary");
                    return helper.getDataUrl(mimetype, data);
                }
                return undefined;
            }
        },
        async readJSON(fileWithPath) {
            const content = await readFile(fileWithPath);
            return JSON.parse(content.toString(), (_, value) => {
                if (typeof value === "string" && value.match(isoDatePattern)) {
                    return new Date(value);
                }
                return value;
            });
        },
    };
    return helper;
}
exports.Files = Files;
//# sourceMappingURL=Files.js.map
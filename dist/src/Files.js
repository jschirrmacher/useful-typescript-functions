"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreviewFolder = getPreviewFolder;
exports.Files = Files;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const allowedSizeOptions = ["width", "height", "fit", "position", "kernel"];
const isoDatePattern = /(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
function getPreviewFolder(options) {
    return ("preview_" +
        Object.keys(options)
            .filter(k => allowedSizeOptions.includes(k))
            .sort((a, b) => a.localeCompare(b))
            .map(k => options[k])
            .join("_")
            .replace(/\s+/g, "-"));
}
function Files({ sharp, fs } = {}) {
    const { mkdir, readFile, writeFile } = fs || promises_1.default;
    const files = {
        mkdirp: async (path) => {
            await mkdir(path, { recursive: true });
        },
        getProjectDir: async (envName, ...path) => {
            const resolved = process.env[envName] || (0, path_1.resolve)(process.cwd(), ...path);
            await files.mkdirp(resolved);
            return resolved;
        },
        getDataUrl: (mimetype, data) => {
            return "data:" + mimetype + ";base64," + data.toString("base64");
        },
        getPreview: async (folder, name, mimetype, options) => {
            const previewFolder = getPreviewFolder(options);
            await files.mkdirp((0, path_1.join)(folder, previewFolder));
            const previewFileName = (0, path_1.join)(folder, previewFolder, name);
            try {
                return files.getDataUrl(mimetype, await readFile(previewFileName));
            }
            catch (error) {
                if (sharp) {
                    const data = await sharp((0, path_1.join)(folder, name)).resize(options).toBuffer();
                    await writeFile(previewFileName, data, "binary");
                    return files.getDataUrl(mimetype, data);
                }
                return undefined;
            }
        },
        readJSON: async (fileWithPath) => {
            const content = await readFile(fileWithPath);
            return JSON.parse(content.toString(), (_, value) => {
                if (typeof value === "string" && value.match(isoDatePattern)) {
                    return new Date(value);
                }
                return value;
            });
        },
        readYAML: async (fileWithPath) => {
            const { parse } = await import("yaml");
            return parse((await readFile(fileWithPath, { encoding: "utf-8" })).toString());
        },
        /**
         * Read YAML configuration file.
         *
         * @param fileWithPath Path and name of configuration file in YAML format
         * @param withoutSecrets deletes a possibly existing `secrets` entry, defaults to true
         * @returns
         */
        readConfig: async (fileWithPath, withoutSecrets = true) => {
            try {
                const config = await files.readYAML(fileWithPath);
                if (withoutSecrets) {
                    delete config.secrets;
                }
                return config;
            }
            catch (error) {
                if (error.code === "ENOENT") {
                    return { isDefault: true };
                }
                throw error;
            }
        },
    };
    return files;
}
//# sourceMappingURL=Files.js.map
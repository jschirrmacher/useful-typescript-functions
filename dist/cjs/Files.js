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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = exports.getPreviewFolder = void 0;
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
                    await writeFile(previewFileName, data, "binary");
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
        async readYAML(fileWithPath) {
            const yaml = await Promise.resolve().then(() => __importStar(require("yamljs")));
            try {
                return yaml.parse((await readFile(fileWithPath, { encoding: "utf-8" })).toString());
            }
            catch (error) {
                throw error;
            }
        },
        async readConfig(fileWithPath, withoutSecrets = true) {
            try {
                const config = await helper.readYAML(fileWithPath);
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
    return helper;
}
exports.Files = Files;
//# sourceMappingURL=Files.js.map
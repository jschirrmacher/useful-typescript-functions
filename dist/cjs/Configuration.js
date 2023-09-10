"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const yamljs_1 = __importDefault(require("yamljs"));
function Configuration(configFile = (0, path_1.resolve)(process.cwd(), "config.yaml"), { existsSync, readFileSync } = fs_1.default) {
    const configuration = existsSync(configFile)
        ? yamljs_1.default.parse(readFileSync(configFile).toString())
        : { isDefault: true };
    const { backend: backendConfiguration, ...frontendConfiguration } = configuration;
    return { backendConfiguration, frontendConfiguration };
}
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map
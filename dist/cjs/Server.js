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
exports.routerBuilder = exports.middlewares = exports.stopServer = exports.setupServer = exports.RestError = exports.restMethod = void 0;
const express_1 = __importStar(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fs_1 = require("fs");
const http_1 = require("http");
exports.restMethod = ["get", "post", "put", "patch", "delete"];
class RestError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.RestError = RestError;
async function setupServer(options) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler = (error, req, res, _next) => {
        config.logger.error(error);
        res.status(error instanceof RestError ? error.status : 500).json({ error: error.message });
    };
    const app = options?.app || (0, express_1.default)();
    const config = {
        app,
        server: options?.server || (0, http_1.createServer)(app),
        port: 8080,
        logger: console,
        middlewares: [],
        ...options,
    };
    config.readableResponses && config.app.set("json spaces", 2);
    config.app.use(express_1.default.urlencoded({ extended: false }));
    config.app.use(express_1.default.json());
    config.middlewares.forEach(middleware => config.app?.use(middleware));
    config.app.use((req, res, next) => next(new RestError(404, "path not found")));
    config.app.use(errorHandler);
    return new Promise(resolve => {
        config.server?.listen(config.port, () => {
            config.logger.info(`Running on http://localhost:${config.port}`);
            process.on("beforeExit", () => stopServer(config));
            resolve(config);
        });
    });
}
exports.setupServer = setupServer;
function stopServer(config) {
    config.server?.close();
}
exports.stopServer = stopServer;
exports.middlewares = {
    staticFiles(distPath) {
        const staticFilesMiddleware = (0, express_1.Router)();
        if ((0, fs_1.existsSync)(distPath)) {
            const indexPage = (0, fs_1.readFileSync)(distPath + "/index.html").toString();
            staticFilesMiddleware.use(express_1.default.static(distPath));
            staticFilesMiddleware.use((req, res) => res.send(indexPage));
        }
        return staticFilesMiddleware;
    },
    requestLogger(logger, logLevel) {
        const loggingMiddleware = (0, express_1.Router)();
        if (logLevel === "debug") {
            loggingMiddleware.use((req, res, next) => {
                logger.debug(`${req.method} ${req.path}`);
                next();
            });
        }
        return loggingMiddleware;
    },
    fileUpload(maxUploadSize) {
        return (0, express_fileupload_1.default)({
            safeFileNames: true,
            preserveExtension: true,
            limits: { fileSize: maxUploadSize },
        });
    },
};
function routerBuilder(basePath) {
    function tryCatch(handler) {
        return async (req, res, next) => {
            try {
                const result = await handler(req, res, next);
                if (result) {
                    res.json(result);
                }
                else {
                    next();
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
    const router = (0, express_1.Router)();
    const routeDefinition = (method) => (path, ...handlers) => {
        router[method]((basePath || "") + path, ...handlers.map(tryCatch));
        return builder;
    };
    const builder = Object.assign({ build: () => router }, ...exports.restMethod.map(method => ({ [method]: routeDefinition(method) })));
    return builder;
}
exports.routerBuilder = routerBuilder;
//# sourceMappingURL=Server.js.map
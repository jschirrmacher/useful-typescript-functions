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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineRouter = exports.stopServer = exports.setupServer = exports.Redirection = exports.RestError = exports.restMethod = void 0;
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
class Redirection extends Error {
    constructor(location, temporary = true) {
        super("Redirect");
        this.location = location;
        this.status = temporary ? 302 : 301;
    }
}
exports.Redirection = Redirection;
async function setupServer(options) {
    const express = (await Promise.resolve().then(() => __importStar(require("express")))).default;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler = (error, req, res, _next) => {
        if (error instanceof RestError && error.status === 404) {
            config.logger.error(`404 Not found: ${req.method.toUpperCase()} ${req.path}`);
        }
        else {
            config.logger.error(error);
        }
        res.status(error instanceof RestError ? error.status : 500).json({ error: error.message });
    };
    const app = options?.app || express();
    const config = {
        app,
        server: options?.server || (0, http_1.createServer)(app),
        port: 8080,
        logger: console,
        routers: [],
        ...options,
    };
    config.readableResponses && config.app.set("json spaces", 2);
    config.app.use(express.urlencoded({ extended: false }));
    config.app.use(express.json());
    if (config.logRequests) {
        config.app.use(await requestLogger(config.logger));
    }
    if (config.fileUpload) {
        config.app.use(await fileUploadMiddleware(config.fileUpload.maxSize));
    }
    await Promise.all(config.routers.map(async (router) => {
        const buildFunction = router.build || ((handler) => handler);
        config.app.use(await buildFunction());
    }));
    if (config.staticFiles) {
        config.app.use(await staticFiles(config.staticFiles));
    }
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
async function staticFiles(distPath) {
    const express = await Promise.resolve().then(() => __importStar(require("express")));
    const staticFilesMiddleware = express.Router();
    if ((0, fs_1.existsSync)(distPath)) {
        const indexPage = (0, fs_1.readFileSync)(distPath + "/index.html").toString();
        staticFilesMiddleware.use(express.static(distPath));
        staticFilesMiddleware.use((req, res) => res.send(indexPage));
    }
    return staticFilesMiddleware;
}
async function requestLogger(logger) {
    const express = await Promise.resolve().then(() => __importStar(require("express")));
    const loggingMiddleware = express.Router();
    loggingMiddleware.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`);
        next();
    });
    return loggingMiddleware;
}
async function fileUploadMiddleware(maxUploadSize) {
    const FileUpload = (await Promise.resolve().then(() => __importStar(require("express-fileupload")))).default;
    return FileUpload({
        safeFileNames: true,
        preserveExtension: true,
        limits: { fileSize: maxUploadSize },
    });
}
function tryCatch(handler) {
    return async (req, res, next) => {
        try {
            const result = await handler(req, res, next);
            if (result !== undefined) {
                if (req.header("accept")?.match(/json/) || "object" === typeof result) {
                    res.json(result);
                }
                else {
                    res.send(result);
                }
            }
            else {
                next();
            }
        }
        catch (error) {
            if (error instanceof Redirection) {
                res.status(error.status).location(error.location).json({ redirectTo: error.location });
            }
            else {
                next(error);
            }
        }
    };
}
function defineRouter(basePath, name) {
    const routes = [];
    const definition = Object.assign({
        async build() {
            const { Router } = await Promise.resolve().then(() => __importStar(require("express")));
            const router = Router();
            if (name) {
                Object.defineProperty(router, "name", { value: name });
            }
            routes.forEach(route => {
                router[route.method]((basePath || "") + route.path, ...route.handlers.map(tryCatch));
            });
            return router;
        },
    }, ...exports.restMethod.map(method => ({
        [method]: (path, ...handlers) => {
            routes.push({ method, path, handlers });
            return definition;
        },
    })));
    return definition;
}
exports.defineRouter = defineRouter;
//# sourceMappingURL=Server.js.map
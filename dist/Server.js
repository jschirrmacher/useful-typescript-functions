"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineRouter = exports.stopServer = exports.setupServer = exports.Redirection = exports.RestError = exports.restMethod = void 0;
const fs_1 = require("fs");
const http_1 = require("http");
const path_1 = require("path");
exports.restMethod = ["get", "post", "put", "patch", "delete"];
class RestError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.RestError = RestError;
class Redirection extends Error {
    location;
    status;
    constructor(location, temporary = true) {
        super("Redirect");
        this.location = location;
        this.status = temporary ? 302 : 301;
    }
}
exports.Redirection = Redirection;
async function setupServer(options) {
    const express = (await import("express")).default;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler = (error, req, res, _next) => {
        if (!config.logRequests && error instanceof RestError && error.status === 404) {
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
        if (router.build) {
            const handler = await router.build();
            config.app.use(handler);
        }
        else {
            config.app.use(router);
        }
    }));
    if (config.staticFiles) {
        const paths = Array.isArray(config.staticFiles) ? config.staticFiles : [config.staticFiles];
        config.app.use(await staticFiles(paths));
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
async function staticFiles(distPaths) {
    const express = (await import("express")).default;
    const staticFilesMiddleware = express.Router();
    distPaths
        .filter(distPath => (0, fs_1.existsSync)(distPath))
        .forEach(distPath => {
        staticFilesMiddleware.use(express.static(distPath, { fallthrough: true }));
        const indexFilePath = (0, path_1.join)(distPath, "index.html");
        if ((0, fs_1.existsSync)(indexFilePath)) {
            staticFilesMiddleware.use((req, res, next) => {
                if (req.method === "GET" && !req.header("accept")?.match(/json/)) {
                    res.sendFile(indexFilePath);
                }
                else {
                    next();
                }
            });
        }
    });
    return staticFilesMiddleware;
}
async function requestLogger(logger) {
    const express = (await import("express")).default;
    const loggingMiddleware = express.Router();
    loggingMiddleware.use((req, res, next) => {
        res.on("finish", () => {
            logger.debug(`${res.statusCode}: ${req.method.toUpperCase()} ${req.path}`);
        });
        next();
    });
    return loggingMiddleware;
}
async function fileUploadMiddleware(maxUploadSize) {
    const FileUpload = (await import("express-fileupload")).default;
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
            const { Router } = (await import("express")).default;
            const router = Router();
            if (name) {
                Object.defineProperty(router, "name", { value: name });
            }
            routes.forEach(route => {
                const handlers = route.handlers.map(tryCatch);
                router[route.method]((basePath || "") + route.path, ...handlers);
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
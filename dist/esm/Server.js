import { existsSync, readFileSync } from "fs";
import { createServer } from "http";
export const restMethod = ["get", "post", "put", "patch", "delete"];
export class RestError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
export class Redirection extends Error {
    constructor(location, temporary = true) {
        super("Redirect");
        this.location = location;
        this.status = temporary ? 302 : 301;
    }
}
export async function setupServer(options) {
    const express = (await import("express")).default;
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
        server: options?.server || createServer(app),
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
export function stopServer(config) {
    config.server?.close();
}
async function staticFiles(distPath) {
    const express = await import("express");
    const staticFilesMiddleware = express.Router();
    if (existsSync(distPath)) {
        const indexPage = readFileSync(distPath + "/index.html").toString();
        staticFilesMiddleware.use(express.static(distPath));
        staticFilesMiddleware.use((req, res) => res.send(indexPage));
    }
    return staticFilesMiddleware;
}
async function requestLogger(logger) {
    const express = await import("express");
    const loggingMiddleware = express.Router();
    loggingMiddleware.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`);
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
export function defineRouter(basePath, name) {
    const routes = [];
    const definition = Object.assign({
        async build() {
            const { Router } = await import("express");
            const router = Router();
            if (name) {
                Object.defineProperty(router, "name", { value: name });
            }
            routes.forEach(route => {
                router[route.method]((basePath || "") + route.path, ...route.handlers.map(tryCatch));
            });
            return router;
        },
    }, ...restMethod.map(method => ({
        [method]: (path, ...handlers) => {
            routes.push({ method, path, handlers });
            return definition;
        },
    })));
    return definition;
}
//# sourceMappingURL=Server.js.map
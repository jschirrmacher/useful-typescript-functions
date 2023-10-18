import express, { Router } from "express";
import fileUpload from "express-fileupload";
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
        middlewares: [],
        ...options,
    };
    config.readableResponses && config.app.set("json spaces", 2);
    config.app.use(express.urlencoded({ extended: false }));
    config.app.use(express.json());
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
export function stopServer(config) {
    config.server?.close();
}
export const middlewares = {
    staticFiles(distPath) {
        const staticFilesMiddleware = Router();
        if (existsSync(distPath)) {
            const indexPage = readFileSync(distPath + "/index.html").toString();
            staticFilesMiddleware.use(express.static(distPath));
            staticFilesMiddleware.use((req, res) => res.send(indexPage));
        }
        return staticFilesMiddleware;
    },
    requestLogger(logger, logLevel) {
        const loggingMiddleware = Router();
        if (logLevel === "debug") {
            loggingMiddleware.use((req, res, next) => {
                logger.debug(`${req.method} ${req.path}`);
                next();
            });
        }
        return loggingMiddleware;
    },
    fileUpload(maxUploadSize) {
        return fileUpload({
            safeFileNames: true,
            preserveExtension: true,
            limits: { fileSize: maxUploadSize },
        });
    },
};
export function routerBuilder(basePath, name) {
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
    const router = Router();
    if (name) {
        Object.defineProperty(router, "name", { value: name });
    }
    const routeDefinition = (method) => (path, ...handlers) => {
        router[method]((basePath || "") + path, ...handlers.map(tryCatch));
        return builder;
    };
    const builder = Object.assign({ build: () => router }, ...restMethod.map(method => ({ [method]: routeDefinition(method) })));
    return builder;
}
//# sourceMappingURL=Server.js.map
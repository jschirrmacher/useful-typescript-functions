"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
require("./vitest");
const supertest_1 = __importDefault(require("supertest"));
const Server_js_1 = require("./Server.js");
const Logger_js_1 = require("./Logger.js");
const logger = (0, Logger_js_1.Logger)();
function expectServerStartLog() {
    logger.expect({ level: "info", message: "Running on http://localhost:8080" });
}
const notAllowedCode = 403;
const notAllowedError = new Server_js_1.RestError(notAllowedCode, "not allowed");
const notAllowed = (0, Server_js_1.defineRouter)().get("/abc", (req, res, next) => next(notAllowedError));
const url = "https://new-service.org";
const redirectMiddleware = (0, Server_js_1.defineRouter)("/", "redirect").get("abc", () => {
    throw new Server_js_1.Redirection(url);
});
const plainText = "plain text";
const textMiddleware = (0, Server_js_1.defineRouter)("/", "text").get("", () => plainText);
(0, vitest_1.describe)("Server", () => {
    let config;
    (0, vitest_1.describe)("setupServer", () => {
        (0, vitest_1.beforeEach)(() => {
            logger.runInTest(vitest_1.expect);
            expectServerStartLog();
        });
        (0, vitest_1.afterEach)(() => {
            config && (0, Server_js_1.stopServer)(config);
            config = undefined;
            (0, vitest_1.expect)(logger).toLogAsExpected();
        });
        (0, vitest_1.describe)("requestLogger", () => {
            (0, vitest_1.it)("should log requests in debug mode", async () => {
                logger.expect({ level: "debug", message: "200: GET /" });
                config = await (0, Server_js_1.setupServer)({ logger, routers: [textMiddleware], logRequests: true });
                await (0, supertest_1.default)(config.app).get("/");
            });
            (0, vitest_1.it)("should log response codes of unknown routes", async () => {
                logger.expect({ level: "error", message: "path not found" });
                logger.expect({ level: "debug", message: "404: GET /" });
                config = await (0, Server_js_1.setupServer)({ logger, routers: [], logRequests: true });
                await (0, supertest_1.default)(config.app).get("/");
            });
            (0, vitest_1.it)("should not log requests if option is not set", async () => {
                config = await (0, Server_js_1.setupServer)({ logger, routers: [textMiddleware] });
                await (0, supertest_1.default)(config.app).get("/");
            });
        });
        (0, vitest_1.describe)("staticFiles", () => {
            (0, vitest_1.it)("should serve files in dist folder", async () => {
                config = await (0, Server_js_1.setupServer)({ logger, staticFiles: __dirname });
                const response = await (0, supertest_1.default)(config.app).get(__filename.replace(__dirname, ""));
                (0, vitest_1.expect)(response.status).toBe(200);
                (0, vitest_1.expect)(response.body.toString().split("\n")).toContain(`// this comment is here for test purposes`);
            });
            (0, vitest_1.it)("should serve the index.html file if file is not found, but request method is GET", async () => {
                config = await (0, Server_js_1.setupServer)({ logger, staticFiles: __dirname });
                const response = await (0, supertest_1.default)(config.app).get("/non-existing-file");
                (0, vitest_1.expect)(response.status).toBe(200);
                (0, vitest_1.expect)(response.text).toEqual(`this file exists only for test purposes.\n`);
            });
            (0, vitest_1.it)("should work without an index.html file inside the static files folder", async () => {
                logger.expect({ level: "debug", message: "404: GET /non-existing-file" });
                logger.expect({ level: "error", message: "path not found" });
                config = await (0, Server_js_1.setupServer)({
                    logger,
                    logRequests: true,
                    staticFiles: __dirname + "/streams",
                });
                const response = await (0, supertest_1.default)(config.app).get("/non-existing-file");
                (0, vitest_1.expect)(response.status).toBe(404);
            });
        });
        (0, vitest_1.describe)("fileUpload", () => {
            (0, vitest_1.it)("should accept a file as upload", async () => {
                const routers = [(0, Server_js_1.defineRouter)().post("/uploads", (req) => req.files)];
                config = await (0, Server_js_1.setupServer)({ logger, fileUpload: { maxSize: 100000 }, routers });
                const result = await (0, supertest_1.default)(config.app).post("/uploads").attach("file", __filename);
                const file = Buffer.from(result.body.file.data.data).toString();
                (0, vitest_1.expect)(file.split("\n")).toContain(`// this comment is here for test purposes`);
            });
        });
        (0, vitest_1.it)("should not log complete error messages with stack on 404 errors", async () => {
            logger.expect({ level: "error", message: "404 Not found: GET /non-existing-file" });
            config = await (0, Server_js_1.setupServer)({ logger });
            await (0, supertest_1.default)(config.app).get("/non-existing-file").expect(404);
        });
        (0, vitest_1.it)("should return the error code", async () => {
            logger.expect({ level: "error", message: "not allowed" });
            config = await (0, Server_js_1.setupServer)({ logger, routers: [notAllowed] });
            await (0, supertest_1.default)(config.app).get("/abc").expect(notAllowedCode);
        });
        (0, vitest_1.it)("should log errors", async () => {
            logger.expect({ level: "error", message: "not allowed" });
            config = await (0, Server_js_1.setupServer)({ logger, routers: [notAllowed] });
            await (0, supertest_1.default)(config.app).get("/abc");
        });
        (0, vitest_1.it)("should send the error message in JSON format", async () => {
            logger.expect({ level: "error", message: "not allowed" });
            config = await (0, Server_js_1.setupServer)({ logger, routers: [notAllowed] });
            const result = await (0, supertest_1.default)(config.app).get("/abc");
            (0, vitest_1.expect)(result.body).toEqual({ error: "not allowed" });
        });
        (0, vitest_1.it)("should handle redirects", async () => {
            config = await (0, Server_js_1.setupServer)({ logger, routers: [redirectMiddleware] });
            const result = await (0, supertest_1.default)(config.app).get("/abc");
            (0, vitest_1.expect)(result.statusCode).toEqual(302);
            (0, vitest_1.expect)(result.headers).toEqual(vitest_1.expect.objectContaining({ location: url }));
        });
        (0, vitest_1.it)("should send text responses if the handler returns plain text", async () => {
            config = await (0, Server_js_1.setupServer)({ logger, routers: [textMiddleware] });
            const result = await (0, supertest_1.default)(config.app).get("/").expect(200);
            (0, vitest_1.expect)(result.text).toEqual(plainText);
        });
        (0, vitest_1.it)("should force json responses if the accept header is set to json", async () => {
            config = await (0, Server_js_1.setupServer)({ logger, routers: [textMiddleware] });
            const result = await (0, supertest_1.default)(config.app)
                .get("/")
                .set("Accept", "application/json")
                .expect(200);
            (0, vitest_1.expect)(result.text).toEqual(`"${plainText}"`);
        });
    });
    (0, vitest_1.describe)("defineRouter()", () => {
        Server_js_1.restMethod.forEach(method => {
            (0, vitest_1.it)(`should have a method for defining a ${method}() method`, () => {
                const router = (0, Server_js_1.defineRouter)();
                (0, vitest_1.expect)(router).toHaveProperty(method);
                (0, vitest_1.expect)(router[method]).toBeInstanceOf(Function);
            });
        });
        (0, vitest_1.describe)("in server", () => {
            (0, vitest_1.beforeEach)(() => {
                logger.runInTest(vitest_1.expect);
                expectServerStartLog();
            });
            (0, vitest_1.afterEach)(() => {
                config && (0, Server_js_1.stopServer)(config);
                config = undefined;
                (0, vitest_1.expect)(logger).toLogAsExpected();
            });
            (0, vitest_1.it)("should prepend a base path to all defined routes", async () => {
                const router = (0, Server_js_1.defineRouter)("/base-path").get("/my-path", () => `Hello world`);
                config = await (0, Server_js_1.setupServer)({ logger, routers: [router] });
                const result = await (0, supertest_1.default)(config.app).get("/base-path/my-path").expect(200);
                (0, vitest_1.expect)(result.text).toEqual("Hello world");
            });
            (0, vitest_1.it)("should handle exceptions", async () => {
                logger.expect({ level: "error", status: 400, message: "test exception" });
                const router = (0, Server_js_1.defineRouter)().get("/test", () => {
                    throw new Server_js_1.RestError(400, "test exception");
                });
                config = await (0, Server_js_1.setupServer)({ logger, routers: [router] });
                const result = await (0, supertest_1.default)(config.app).get("/test").expect(400);
                (0, vitest_1.expect)(result.body).toEqual({ error: "test exception" });
            });
        });
    });
});
// this comment is here for test purposes
//# sourceMappingURL=Server.test.js.map
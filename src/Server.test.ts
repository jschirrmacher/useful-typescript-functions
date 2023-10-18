import express, { NextFunction, Request, RequestHandler, Response } from "express"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import "./vitest"
import request from "supertest"
import {
  Redirection,
  RestError,
  ServerConfiguration,
  middlewares,
  restMethod,
  routerBuilder,
  setupServer,
  stopServer,
} from "./Server.js"
import { Logger } from "./Logger.js"

const logger = Logger()

async function simulateFetch(
  handler: RequestHandler,
  method: string,
  path: string,
  role?: string,
  data?: object,
) {
  const app = setupApp(handler)
  const call = request(app)[method](path)
  const prepared = role ? call.set("X-Test-User-Type", role) : call
  return await (data ? prepared.send(data) : prepared)
}

function setupApp(handler) {
  const app = express()
  app.use(express.urlencoded({ extended: false }))
  app.use(express.json())
  app.use((req, res, next) => {
    if (req.header("X-Test-User-Type")) {
      res.locals.user = { roles: req.header("X-Test-User-Type")?.split(",") }
      res.locals.token = "test-token"
    }
    next()
  })
  app.use(handler)
  return app
}

function expectServerStartLog() {
  logger.expect({ level: "info", message: "Running on http://localhost:8080" })
}

const notAllowedCode = 403
const notAllowedError = new RestError(notAllowedCode, "not allowed")
const notAllowed = (req: Request, res: Response, next: NextFunction) => next(notAllowedError)

const url = "https://new-service.org"
const redirectMiddleware = routerBuilder("/", "redirect")
  .get("abc", () => {
    throw new Redirection(url)
  })
  .build()

const plainText = "plain text"
const textMiddleware = routerBuilder("/", "text")
  .get("", () => plainText)
  .build()

describe("Server", () => {
  afterEach(() => {
    expect(logger).toLogAsExpected()
  })

  describe("requestLogger middleware", () => {
    it("should log requests in debug mode", async () => {
      logger.runInTest(expect)
      logger.expect({ level: "debug", message: "POST /path" })
      await simulateFetch(middlewares.requestLogger(logger, "debug"), "post", "/path")
    })

    it("should not log anything when not in debug mode", async () => {
      logger.runInTest(expect)
      await simulateFetch(middlewares.requestLogger(logger, "info"), "post", "/path")
    })
  })

  describe("staticFiles middleware", () => {
    beforeEach(() => {
      logger.runInTest(expect)
    })

    const middleware = middlewares.staticFiles(__dirname)

    it("should serve files in dist folder", async () => {
      const response = await simulateFetch(middleware, "get", __filename.replace(__dirname, ""))
      expect(response.status).toBe(200)
      expect(response.body.toString().split("\n")).toContain(
        `// this comment is here for test purposes`,
      )
    })

    it("should serve the index.html file if file is not found, but request method is GET", async () => {
      const response = await simulateFetch(middleware, "get", "/non-existing-file")
      expect(response.status).toBe(200)
      expect(response.text).toEqual(`this file exists only for test purposes.\n`)
    })
  })

  describe("fileUpload middleware", () => {
    it("should accept a file as upload", async () => {
      logger.runInTest(expect)
      const middleware = middlewares.fileUpload(2 * 1024 * 1024)
      const app = setupApp(middleware)
      const upload = new Promise(async resolve => {
        app.post("/uploads", (req, res) => {
          resolve(req.files)
          res.status(200).json("ok")
        })
      })
      await request(app).post("/uploads").attach("file", __filename)
      const result = await upload
      expect(result).toEqual(
        expect.objectContaining({ file: expect.objectContaining({ name: "Servertest.ts" }) }),
      )
    })
  })

  describe("setupServer", () => {
    let config: ServerConfiguration

    beforeEach(() => {
      logger.runInTest(expect)
      expectServerStartLog()
    })

    afterEach(() => {
      stopServer(config)
    })

    it("should report a 404 error for unknown routes", async () => {
      config = await setupServer({ logger })
      request(config.app).get("/non-existing-file").expect(404)
    })

    it("should not log complete error messages with stack on 404 errors", async () => {
      logger.expect({ level: "error", message: "404 Not found: GET /non-existing-file" })
      config = await setupServer({ logger })
      await request(config.app).get("/non-existing-file").expect(404)
    })

    it("should return the error code", async () => {
      logger.expect({ level: "error", message: "not allowed" })
      config = await setupServer({ logger, middlewares: [notAllowed] })
      await request(config.app).get("/abc").expect(notAllowedCode)
    })

    it("should log errors", async () => {
      logger.expect({ level: "error", message: "not allowed" })
      config = await setupServer({ logger, middlewares: [notAllowed] })
      await request(config.app).get("/abc")
    })

    it("should send the error message in JSON format", async () => {
      logger.expect({ level: "error", message: "not allowed" })
      config = await setupServer({ logger, middlewares: [notAllowed] })
      const result = await request(config.app).get("/abc")
      expect(result.body).toEqual({ error: "not allowed" })
    })

    it("should handle redirects", async () => {
      config = await setupServer({ logger, middlewares: [redirectMiddleware] })
      const result = await request(config.app).get("/abc")
      expect(result.statusCode).toEqual(302)
      expect(result.headers).toEqual(expect.objectContaining({ location: url }))
    })

    it("should send text responses if the handler returns plain text", async () => {
      config = await setupServer({ logger, middlewares: [textMiddleware] })
      const result = await request(config.app)
        .get("/")
        .expect(200)
      expect(result.text).toEqual(plainText)
    })

    it("should force json responses if the accept header is set to json", async () => {
      config = await setupServer({ logger, middlewares: [textMiddleware] })
      const result = await request(config.app)
        .get("/")
        .set("Accept", "application/json")
        .expect(200)
      expect(result.text).toEqual(`"${plainText}"`)
    })
  })

  describe("routerBuilder()", () => {
    let config: ServerConfiguration | undefined

    beforeEach(() => {
      logger.runInTest(expect)
    })

    afterEach(() => {
      config && stopServer(config)
      config = undefined
    })

    it("should return a builder with a `build()` method returning a Router", () => {
      const builder = routerBuilder()
      expect(builder).toHaveProperty("build")
      expect(builder.build().name).toEqual("router")
    })

    restMethod.forEach(method => {
      it(`should have a method for defining a ${method}() method`, () => {
        const builder = routerBuilder()
        expect(builder).toHaveProperty(method)
        expect(builder[method]).toBeInstanceOf(Function)
      })
    })

    it("should prepend a base path to all defined routes", async () => {
      expectServerStartLog()
      const builder = routerBuilder("/base-path")
      builder.get("/my-path", () => `Hello world`)
      config = await setupServer({ logger, middlewares: [builder.build()] })
      const result = await request(config.app).get("/base-path/my-path").expect(200)
      expect(result.text).toEqual("Hello world")
    })

    it("should handle exceptions", async () => {
      expectServerStartLog()
      logger.expect({ level: "error", status: 400, message: "test exception" })
      const router = routerBuilder()
        .get("/test", () => {
          throw new RestError(400, "test exception")
        })
        .build()
      config = await setupServer({ logger, middlewares: [router] })
      const result = await request(config.app).get("/test").expect(400)
      expect(result.body).toEqual({ error: "test exception" })
    })
  })
})

// this comment is here for test purposes

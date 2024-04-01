import { NextFunction, Request, Response } from "express"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import "./vitest"
import request from "supertest"
import {
  Redirection,
  RestError,
  ServerConfiguration,
  defineRouter,
  restMethod,
  setupServer,
  stopServer,
} from "./Server.js"
import { Logger } from "./Logger.js"
import { FileArray, UploadedFile } from "express-fileupload"

const logger = Logger()

function expectServerStartLog() {
  logger.expect({ level: "info", message: "Running on http://localhost:8080" })
}

const notAllowedCode = 403
const notAllowedError = new RestError(notAllowedCode, "not allowed")
const notAllowed = defineRouter().get("/abc", (req: Request, res: Response, next: NextFunction) =>
  next(notAllowedError),
)

const url = "https://new-service.org"
const redirectMiddleware = defineRouter("/", "redirect").get("abc", () => {
  throw new Redirection(url)
})

const plainText = "plain text"
const textMiddleware = defineRouter("/", "text").get("", () => plainText)

describe("Server", () => {
  let config: ServerConfiguration | undefined

  describe("setupServer", () => {
    beforeEach(() => {
      logger.runInTest(expect)
      expectServerStartLog()
    })

    afterEach(() => {
      config && stopServer(config)
      config = undefined
      expect(logger).toLogAsExpected()
    })

    describe("requestLogger", () => {
      it("should log requests in debug mode", async () => {
        logger.expect({ level: "debug", message: "200: GET /" })
        config = await setupServer({ logger, routers: [textMiddleware], logRequests: true })
        await request(config.app).get("/")
      })

      it("should log response codes of unknown routes", async () => {
        logger.expect({ level: "error", message: "path not found" })
        logger.expect({ level: "debug", message: "404: GET /" })
        config = await setupServer({ logger, routers: [], logRequests: true })
        await request(config.app).get("/")
      })

      it("should not log requests if option is not set", async () => {
        config = await setupServer({ logger, routers: [textMiddleware] })
        await request(config.app).get("/")
      })
    })

    describe("staticFiles", () => {
      it("should serve files in dist folder", async () => {
        config = await setupServer({ logger, staticFiles: __dirname })
        const response = await request(config.app).get(__filename.replace(__dirname, ""))
        expect(response.status).toBe(200)
        expect(response.body.toString().split("\n")).toContain(
          `// this comment is here for test purposes`,
        )
      })

      it("should serve the index.html file if file is not found, but request method is GET", async () => {
        config = await setupServer({ logger, staticFiles: __dirname })
        const response = await request(config.app).get("/non-existing-file")
        expect(response.status).toBe(200)
        expect(response.text).toEqual(`this file exists only for test purposes.\n`)
      })

      it("should work without an index.html file inside the static files folder", async () => {
        logger.expect({ level: "debug", message: "404: GET /non-existing-file" })
        logger.expect({ level: "error", message: "path not found" })
        config = await setupServer({ logger, logRequests: true,  staticFiles: __dirname + "/streams" })
        const response = await request(config.app).get("/non-existing-file")
        expect(response.status).toBe(404)
      })
    })

    describe("fileUpload", () => {
      it("should accept a file as upload", async () => {
        const upload = new Promise<FileArray>(async resolve => {
          const handler = (req: Request) => {
            resolve(req.files as FileArray)
            return "ok"
          }
          const routers = [defineRouter().post("/uploads", handler)]
          config = await setupServer({ logger, fileUpload: { maxSize: 100000 }, routers })
          await request(config.app).post("/uploads").attach("file", __filename)
        })
        const files = await upload
        expect(files).toHaveProperty("file")
        const file = files.file as UploadedFile
        expect(file.data.toString().split("\n")).toContain(
          `// this comment is here for test purposes`,
        )
      })
    })

    it("should report a 404 error for unknown routes even if requests are not logged", async () => {
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
      config = await setupServer({ logger, routers: [notAllowed] })
      await request(config.app).get("/abc").expect(notAllowedCode)
    })

    it("should log errors", async () => {
      logger.expect({ level: "error", message: "not allowed" })
      config = await setupServer({ logger, routers: [notAllowed] })
      await request(config.app).get("/abc")
    })

    it("should send the error message in JSON format", async () => {
      logger.expect({ level: "error", message: "not allowed" })
      config = await setupServer({ logger, routers: [notAllowed] })
      const result = await request(config.app).get("/abc")
      expect(result.body).toEqual({ error: "not allowed" })
    })

    it("should handle redirects", async () => {
      config = await setupServer({ logger, routers: [redirectMiddleware] })
      const result = await request(config.app).get("/abc")
      expect(result.statusCode).toEqual(302)
      expect(result.headers).toEqual(expect.objectContaining({ location: url }))
    })

    it("should send text responses if the handler returns plain text", async () => {
      config = await setupServer({ logger, routers: [textMiddleware] })
      const result = await request(config.app).get("/").expect(200)
      expect(result.text).toEqual(plainText)
    })

    it("should force json responses if the accept header is set to json", async () => {
      config = await setupServer({ logger, routers: [textMiddleware] })
      const result = await request(config.app)
        .get("/")
        .set("Accept", "application/json")
        .expect(200)
      expect(result.text).toEqual(`"${plainText}"`)
    })
  })

  describe("defineRouter()", () => {
    restMethod.forEach(method => {
      it(`should have a method for defining a ${method}() method`, () => {
        const router = defineRouter()
        expect(router).toHaveProperty(method)
        expect(router[method]).toBeInstanceOf(Function)
      })
    })

    describe("in server", () => {
      beforeEach(() => {
        logger.runInTest(expect)
        expectServerStartLog()
      })

      afterEach(async () => {
        config && ( stopServer(config))
        config = undefined
        expect(logger).toLogAsExpected()
      })

      it("should prepend a base path to all defined routes", async () => {
        const router = defineRouter("/base-path").get("/my-path", () => `Hello world`)
        config = await setupServer({ logger, routers: [router] })
        const result = await request(config.app).get("/base-path/my-path").expect(200)
        expect(result.text).toEqual("Hello world")
      })

      it("should handle exceptions", async () => {
        logger.expect({ level: "error", status: 400, message: "test exception" })
        const router = defineRouter().get("/test", () => {
          throw new RestError(400, "test exception")
        })
        config = await setupServer({ logger, routers: [router] })
        const result = await request(config.app).get("/test").expect(400)
        expect(result.body).toEqual({ error: "test exception" })
      })
    })
  })
})

// this comment is here for test purposes

import express, { Application, NextFunction, Request, Response, Router } from "express"
import fileUpload from "express-fileupload"
import { existsSync, readFileSync } from "fs"
import { createServer, Server } from "http"
import { LogLevel } from "./Logger.js"

type Logger = Pick<typeof console, "debug" | "info" | "error">
export const restMethod = ["get", "post", "put", "patch", "delete"] as const
type RestMethod = (typeof restMethod)[number]
type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown
type RouterBuilder = { build: () => RequestHandler } & {
  [m in RestMethod]: (path: string, ...handlers: RequestHandler[]) => RouterBuilder
}

export interface ServerConfiguration {
  app?: Application
  server?: Server
  port?: number
  logger?: Logger
  middlewares?: RequestHandler[]
  readableResponses?: boolean
}

export class RestError extends Error {
  status

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function setupServer(options?: ServerConfiguration) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
    config.logger.error(error)
    res.status(error instanceof RestError ? error.status : 500).json({ error: error.message })
  }

  const app = options?.app || express()
  const config = {
    app,
    server: options?.server || createServer(app),
    port: 8080,
    logger: console,
    middlewares: [],
    ...options,
  }

  config.readableResponses && config.app.set("json spaces", 2)

  config.app.use(express.urlencoded({ extended: false }))
  config.app.use(express.json())
  config.middlewares.forEach(middleware => config.app?.use(middleware))
  config.app.use((req, res, next) => next(new RestError(404, "path not found")))
  config.app.use(errorHandler)

  return new Promise<Required<ServerConfiguration>>(resolve => {
    config.server?.listen(config.port, () => {
      config.logger.info(`Running on http://localhost:${config.port}`)
      process.on("beforeExit", () => stopServer(config))
      resolve(config as Required<ServerConfiguration>)
    })
  })
}

export function stopServer(config: ServerConfiguration) {
  config.server?.close()
}

export const middlewares = {
  staticFiles(distPath: string) {
    const staticFilesMiddleware = Router()

    if (existsSync(distPath)) {
      const indexPage = readFileSync(distPath + "/index.html").toString()
      staticFilesMiddleware.use(express.static(distPath))
      staticFilesMiddleware.use((req, res) => res.send(indexPage))
    }
    return staticFilesMiddleware as RequestHandler
  },

  requestLogger(logger: Pick<typeof console, "debug">, logLevel: LogLevel) {
    const loggingMiddleware = Router()

    if (logLevel === "debug") {
      loggingMiddleware.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`)
        next()
      })
    }
    return loggingMiddleware as RequestHandler
  },

  fileUpload(maxUploadSize: number) {
    return fileUpload({
      safeFileNames: true,
      preserveExtension: true,
      limits: { fileSize: maxUploadSize },
    })
  },
}

export function routerBuilder(basePath?: string, name?: string) {
  function tryCatch(handler: RequestHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await handler(req, res, next)
        if (result) {
          res.json(result)
        } else {
          next()
        }
      } catch (error) {
        next(error)
      }
    }
  }

  const router = Router()
  Object.defineProperty(router, "name", { value: name })

  const routeDefinition =
    (method: RestMethod) =>
    (path: string, ...handlers: RequestHandler[]) => {
      router[method]((basePath || "") + path, ...handlers.map(tryCatch))
      return builder
    }
  const builder = Object.assign(
    { build: () => router as RequestHandler },
    ...restMethod.map(method => ({ [method]: routeDefinition(method) })),
  ) as RouterBuilder

  return builder
}

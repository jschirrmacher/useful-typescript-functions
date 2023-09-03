import { createServer } from "http"
import express, {
  Application,
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express"
import { existsSync, readFileSync } from "fs"
import { LogLevel } from "./Logger.js"
import { Server } from "http"

type Logger = Pick<typeof console, "debug" | "info" | "error">

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
    return staticFilesMiddleware
  },

  requestLogger(logger: Pick<typeof console, "debug">, logLevel: LogLevel) {
    const loggingMiddleware = Router()

    if (logLevel === "debug") {
      loggingMiddleware.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`)
        next()
      })
    }
    return loggingMiddleware
  },
}

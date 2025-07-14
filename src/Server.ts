import type { Application, NextFunction, Request, Response } from "express"
import { existsSync } from "fs"
import { createServer, Server } from "http"
import { join } from "path"

type Logger = Pick<typeof console, "debug" | "info" | "error">
export const restMethod = ["get", "post", "put", "patch", "delete"] as const
export type RestMethod = (typeof restMethod)[number]
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown
export type RouterDefinition = {
  [m in RestMethod]: (path: string, ...handlers: RequestHandler[]) => RouterDefinition
} & { build: () => Promise<RequestHandler> }

export interface ServerConfiguration {
  app: Application
  server: Server
  port: number
  logger: Logger
  routers: (RouterDefinition | RequestHandler)[]
  readableResponses?: boolean
  logRequests?: boolean
  fileUpload?: { maxSize: number }
  staticFiles?: string | string[]
  exitHandler?: () => void
}

export class RestError extends Error {
  status

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export class Redirection extends Error {
  location
  status

  constructor(location: string, temporary = true) {
    super("Redirect")
    this.location = location
    this.status = temporary ? 302 : 301
  }
}

export async function setupServer(options?: Partial<ServerConfiguration>) {
  const express = (await import("express")).default

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
    if (!config.logRequests && error instanceof RestError && error.status === 404) {
      config.logger.error(`404 Not found: ${req.method.toUpperCase()} ${req.path}`)
    } else {
      config.logger.error(error)
    }
    res.status(error instanceof RestError ? error.status : 500).json({ error: error.message })
  }

  const app = options?.app || express()
  const config: ServerConfiguration = {
    app,
    server: options?.server || createServer(app),
    port: 8080,
    logger: console,
    routers: [],
    ...options,
  }

  config.readableResponses && config.app.set("json spaces", 2)

  config.app.use(express.urlencoded({ extended: false }))
  config.app.use(express.json())
  if (config.logRequests) {
    config.app.use(await requestLogger(config.logger))
  }
  if (config.fileUpload) {
    config.app.use(await fileUploadMiddleware(config.fileUpload.maxSize))
  }
  await Promise.all(
    config.routers.map(async router => {
      if ((router as RouterDefinition).build) {
        const handler = await (router as RouterDefinition).build()
        config.app.use(handler)
      } else {
        config.app.use(router as RequestHandler)
      }
    }),
  )
  if (config.staticFiles) {
    const paths = Array.isArray(config.staticFiles) ? config.staticFiles : [config.staticFiles]
    config.app.use(await staticFiles(paths))
  }
  config.app.use((req, res, next) => next(new RestError(404, "path not found")))
  config.app.use(errorHandler)

  return new Promise<Required<ServerConfiguration>>(resolve => {
    config.server?.listen(config.port, () => {
      config.logger.info(`Running on http://localhost:${config.port}`)
      config.exitHandler = () => stopServer(config)
      process.on("beforeExit", config.exitHandler)
      resolve(config as Required<ServerConfiguration>)
    })
  })
}

export function stopServer(config: ServerConfiguration) {
  if (config.exitHandler) {
    process.removeListener("beforeExit", config.exitHandler)
    config.exitHandler = undefined
  }
  config.server?.close()
}

async function staticFiles(distPaths: string[]) {
  const express = (await import("express")).default
  const staticFilesMiddleware = express.Router()

  distPaths
    .filter(distPath => existsSync(distPath))
    .forEach(distPath => {
      staticFilesMiddleware.use(express.static(distPath, { fallthrough: true }))
      const indexFilePath = join(distPath, "index.html")
      if (existsSync(indexFilePath)) {
        staticFilesMiddleware.use((req, res, next) => {
          if (req.method === "GET" && !req.header("accept")?.match(/json/)) {
            res.sendFile(indexFilePath)
          } else {
            next()
          }
        })
      }
    })
  return staticFilesMiddleware as RequestHandler
}

async function requestLogger(logger: Logger) {
  const express = (await import("express")).default
  const loggingMiddleware = express.Router()

  loggingMiddleware.use((req, res, next) => {
    res.on("finish", () => {
      logger.debug(`${res.statusCode}: ${req.method.toUpperCase()} ${req.path}`)
    })
    next()
  })
  return loggingMiddleware as RequestHandler
}

async function fileUploadMiddleware(maxUploadSize: number) {
  const FileUpload = (await import("express-fileupload")).default

  return FileUpload({
    safeFileNames: true,
    preserveExtension: true,
    limits: { fileSize: maxUploadSize },
  })
}

function tryCatch(handler: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req, res, next)
      if (result !== undefined) {
        if (req.header("accept")?.match(/json/) || "object" === typeof result) {
          res.json(result)
        } else {
          res.send(result)
        }
      } else {
        next()
      }
    } catch (error) {
      if (error instanceof Redirection) {
        res.status(error.status).location(error.location).json({ redirectTo: error.location })
      } else {
        next(error)
      }
    }
  }
}

export function defineRouter(basePath?: string, name?: string) {
  const routes = [] as { method: RestMethod; path: string; handlers: RequestHandler[] }[]

  const definition = Object.assign(
    {
      async build() {
        const { Router } = (await import("express")).default
        const router = Router()
        if (name) {
          Object.defineProperty(router, "name", { value: name })
        }

        routes.forEach(route => {
          const handlers: RequestHandler[] = route.handlers.map(tryCatch)
          router[route.method]((basePath || "") + route.path, ...handlers)
        })

        return router
      },
    },
    ...restMethod.map(method => ({
      [method]: (path: string, ...handlers: RequestHandler[]) => {
        routes.push({ method, path, handlers })
        return definition
      },
    })),
  ) as RouterDefinition

  return definition
}

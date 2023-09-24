## `Server`

Helps running a http server based on expressjs. It brings a configuration to enable consuming JSON data, handle non-existing routes by returning a 404 error, and a general error handler which catches `RestError`s, logs them, and creating a response with the corresponding status and a JSON content with more information about the error.

There is a `stopServer` function for controlled shutdown of the server. It is automatically called when the process ends, but is helpful when testing the server.

Additionally, you can register middlewares. It also provides standard ones to serve static assets.

The simplest use is to call

```ts
const { app } = await setupServer()
app.get("/data, (req, res) => res.send(`Hello ${req.query.name}!`))
```

There is no need to call `app.listen()`, this is already done be `setupServer()`.

`setupServer()` accepts a couple of options, given as a parameter:

```ts
await setupServer({
  app,          // an own `expressjs` application instead of the standard one
  server,       // an own http server
  port,         // a custom port number for the server, default is 8080
  logger,       // a custom logger to use instead of console
  middlewares,  // an array of additional middlewares
  readableResponses // a boolean flag to create more readable JSON responses
})
```

### Setting up routes

There is a `routerBuilder()` function which simplifies creating routes on the server. Using it looks like this:

```ts
const router = routerBuilder()
  .get("/greetings", () => `Hello world`)
  .build()
```

The router can then be used as a middleware for the server.

The builder can get an optional base path which every route defined on the router will be prepended with.

### Provided Middlewares

#### `staticFiles(distPath: string)`

This function returns an optional middleware to be used for `setupServer()` which serves files in the specified `distPath` folder. This folder should also contain an `index.html` file, which is served if the requested file does not exist. This helps creating single page applications aware of deep links.

#### `requestLogger(logger: Logger, level: LogLevel)`

Use this logger middleware if you want to log requests handled by the server. The `level` parameter defines, if log messages actually occur. A good practice could be to provide `process.env.LOGLEVEL` here. If it is set to `debug`, the requests are acutally logged.

#### `fileUpload(maxUploadSize: number)`

A middleware to allow file uploads.

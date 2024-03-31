# Server

Helps running a http server based on express.js. It brings a configuration to enable consuming JSON data, handle non-existing routes by returning a 404 error, and a general error handler which catches `RestError`s, logs them, and creating a response with the corresponding status and a JSON content with more information about the error.

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
  app,          // an own `express.js` application instead of the standard one
  server,       // an own http server
  port,         // a custom port number for the server, default is 8080
  logger,       // a custom logger to use instead of console
  routers,      // an array of additional routers, created by defineRouter() (see below) or just express.RequestHandlers
  readableResponses // a boolean flag to create more readable JSON responses
  logRequests   // set to a log level to enable request logging. If not set, no requests are logged
  fileUpload    // set a max file size to enable file uploads. If not set, files cannot be uploaded
  staticFiles   // set a path or a list of paths to be served as static files
})
```

## Setting up routers

There is a `defineRouter()` function which simplifies creating routes on the server. Using it looks like this:

```ts
const router = defineRouter()
  .get("/greetings", () => `Hello world`)
  .post("/login", req => (req.body.userId === "jenny" ? "Hi Jenny" : "Unknown user"))
```

The router can then be used for setting up the server.

The router can get an optional base path which every route defined on the router will be prepended with.

If the return value of a handler is `undefined`, the next handler is invoked. If not, the return value is used as the body of the response. In case of an object or an array, the response will get an "Content-Type" of `application/json`, else it is `text/plain`. If the client sends an `Accept: application/json` header, the response is `application/json` in any case.

It is possible to send errors by throwing an `RestError`. Its constructor will get the status code and the error text as parameters. The response will get this status code and an `application/json` content containing an object with an `error` attribute with the error text.

If you throw a `Redirection`, a `Location` header will be sent with the URL specified in the `Redirection` object. Its constructor accepts also a `temporary` parameter, which defaults to `true` which means that it is a temporary redirect ([http/302](https://http.cat/302)). If you set it to `false`, a [status code of 301](https://http.cat/301) is used, which means that the redirect might be cached by the client, so that is permanent.

## Provided middlewares

### Static files

If you set a file path to `staticFiles` parameter of `setupServer()`, the server will serve files from there. If the folder contains an `index.html` file, it will be served if the requested file does not exist. This helps creating single page applications aware of deep links.

It is also possible to use an array of paths, if you need multiple folders to be served statically. Remember that the first `index.html` file will be served, when no other matching file is found. If more than one of the specified folders contain such a file, it will be served, even if some other folders contain files that match the requested file name. Best would be, if there is only one `index.html` file in the static files folders, and this folder is specified as the last one in the array.

### Logging requests

Set the `logRequests` parameter of `setupServer()` if you want requests to be logged. The response code will also be logged.

### Use file uploads

Set `fileUpload` parameter of `setupServer()` to a configuration object to enable file uploads. The configuration currently only allow to set the maximum `maxSize` of an upload. The size is specified in Bytes.

You need to add `express-fileupload` as a dependency, if you want to use file uploads.

## Upgrading from version 2

The following changes need to be done to upgrade from version 2 of `useful-typescript-functions`:

1. The `middlewares` parameter of `setupServer()` is replaced by a `routers` parameter. It receives an array of router definitions, created by the new `defineRouter()` function (see below).
2. Instead of using predefined `middleware`s, now there are parameters `staticFiles`, `logRequests` and `fileUpload` for `setupServer()`.
3. The new function `defineRouter()` replaces the previous `routerBuild()` function. It gets the same parameters, but you don't need to call `build()` at the end. Just put the result of `defineRouter()` into the `routers` parameter of `setupServer()`. `express.js` RequestHandlers can be kept unmodified and be mixed with RouterDefinitions from `defineRouter()` just like before.

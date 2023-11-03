# Useful TypeScript Functions

A dependency-free collection of useful functions for applications in TypeScript. (Actually, you need some peer libraries if you use some of the functions). Written in Typescript and works for CJS and ESM.

- [**Objects** for working with objects](src/Objects.md)
- [**oneByOne** run asynchronous functions one after each other](#onebyone)
- [**Logger** a structured log file generator which can easily be tested](#logger)
- [**CSVLogger** can be used to log to a CSV file](#csvlogger)
- [**Server** to simplify creation of express.js servers and routers](src/Server.md)
- [**Files** to help handle files, especially image previews](src/Files.md)
- [**Mailer** for sending html templated emails easily](src/Mailer.md)

## Upgrade from version 2

There are some breaking changes of version 3.

- If you use `Server`, you should have a look into the [this upgrade info](src/Server.md#upgrading-from-version-2).
- Previously deprecated functions `flattenObject()` and `inflateObject()` are now removed. You now need to move to `flatten` and `inflate()` now.

## `oneByOne`

Run asynchronous functions one after each other. Each of the functions get the resolved value of the previous
function as a parameter. The last result is resolved by oneByOne().

```ts
const result = await oneByOne([
  async () => readUsers(),
  async (users: User[]) => readEntries(users),
])
```

## `Logger`

A testable [JSONL](https://jsonlines.org/) (Newline separated JSON) logger which allows to intercept log messages, and test for expected ones in a test, or even check for unexpected ones.

### Usage in a program

```ts
import { Logger } from "useful-typescript-functions"

const logger = Logger()

logger.debug("test")
logger.info({ message: "structured log data", source: "this program" })

logger.setGlobal({ info: "global information" })
logger.error("an error occurred")
```

results in

```JSON
{"level":"debug","message":"test"}
{"level":"info","message":"structured log data","source":"this program"}
{"level":"error","message":"an error occurred","info":"global information"}
```

### Usage in a test

```ts
import { beforeEach, describe, expect, it } from "vitest"
import { Logger } from "useful-typescript-functions"

const logger = Logger()

describe("my test", () => {
  beforeEach(() => {
    // use this in `beforeEach` to reset all log entries from previous test runs
    logger.runInTest(expect) // required to make `toLogAsExpected()` matcher available
  })

  it("should not send any unexpected log messages but the expected one", () => {
    logger.expect({ level: "warn", message: "expected message" })
    logger.expect({ level: "debug", message: "another expected message" })

    logger.warn("expected message")
    logger.debug("unexpected message")

    expect(logger).toLogAsExpected()
  })
})
```

Will result in:

```diff
- Expected  - 8
+ Received  + 0

  {
    expected: [
+     {
+       level: 'debug',
+       message: 'another expected message',
+     },
    ],
    unexpected: [
+     {
+       level: 'debug',
+       message: 'unexpected message',
+     },
    ],
  }
```

## `CSVLogger`

The CSVLogger allows to log a fixed data structure to be logged into a file.
You can either specify the list of properties when instantiating the CSVLogger, or it will take the properties of the first call's parameter as the relevant fields to include in the log.

The CSVLogger will return an object which contains three functions to work on the specified file:

### `append()`

Appends a CSV line to the log.

```ts
import { CSVLogger } from "useful-typescript-functions"

const log = CSVLogger("test.csv", ["level", "message", "data"])
log.append({ level: "info", message: "text", data: "more info" })
```

will write the following lines into `test.csv`:

```csv
level,message,data
info,text,more info
```

Successive calls to `append()` will add data lines to the file, but not additional header lines. Values containing special meaning in csv will be escaped.

### `read()`

Reads csv data from an existing file.

The above csv file can be read in as follows:

```ts
import { CSVLogger } from "useful-typescript-functions"

const log = CSVLogger("test.csv")
console.log(log.read())

// [ { level: 'info', message: 'text', data: 'more info' } ]
```

### `getTransport()`

Returns a function to be used as a Transport for [Logger](#logger).

```ts
import { CSVLogger, Logger } from "useful-typescript-functions"

const logger = Logger()
const file = CSVLogger("test.csv")
logger.setTransport(file.getTransport())
logger.info({ message: "text", data: "more info" })
logger.debug("another log output")
```

will write the following lines into `test.csv`:

```csv
level,message,data
info,text,more info
debug,another log output,
```

As you see, the `level` field is automatically added due to the fact that you logged with `logger.info`. Like that, if you log only a string message instead of an object, the level and the message will be written to the file.

While this will work as expected, it is a good idea to specify the fields to be logged explicitly in the `CSVLogger()` call. If so, even non existing properties in the logged objects will be contained as empty CSV fields.

If you do not specify the fields explicitly, only the properties contained in the first logged object will be contained in the log of successive log outputs, while any other will be ignored.

## `Configuration`

A function to read a configuration file containing settings for a backend and a frontend.
The default configuration file name is `config.yaml` in the working directory (the directory from where the program was started, if not explicitly changed).

Usage example:

```ts
import { Configuration } from "useful-typescript-functions"

const { frontendConfiguration, backendConfiguration } = Configuration()

sendmail(recipient, backendConfiguration.mailSender, "Test", "A test email")
```

The `Configuration` function accepts a parameter to specify an alternative path to a file to read. In every case, the configuration file is expected to be a YAML file, containing properties which can be scalar, arrays or records in any depth.

All settings in the configuration file are expected to be frontend related and land in `frontendConfiguration`, only settings in an optional `backend` property are hidden from the `frontendConfiguration`, but land in `backendConfiguration`.

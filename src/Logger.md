# `Logger`

A testable [JSONL](https://jsonlines.org/) (Newline separated JSON) logger which allows to intercept log messages, and test for expected ones in a test, or even check for unexpected ones.

## Usage in a program

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

## Usage in a test

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

## Set an alternative transport with `setTransport()`

Sets an alternative transport.

```ts
import { Logger, createCSVTransport } from "useful-typescript-functions"

const logger = Logger()
logger.setTransport(createCSVTransport("test.csv"))
logger.info({ message: "text", data: "more info" })
logger.debug("another log output")
```

will write the following lines into `test.csv`:

```csv
level,message,meta
info,text,{""data"":""more info""}
debug,another log output,{}
```

As you see, the `level` field is automatically added due to the fact that you logged with `logger.info`.

Instead of using a CSV transport, you can also use a JSONL transport by calling `createJSONLTransport()`, which can also be imported from `useful-typescript-functions`.

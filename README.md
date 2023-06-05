# Missing TypeScript Functions

A useful collection of functions missing in TypeScript.

- [**diff** two complex objects](#diff)
- [**flatten** a complex object to a list of attributes with their values](#flatten)
- [**inflate** a complex object from a list of attributes](#inflate)
- [**renameAttribute** in a flat object](#renameAttribute)
- [**mutate** only allowed fields of a flat object](#mutate)
- [**oneByOne** run asynchronous functions one after each other](#onebyone)
- [**Logger** a structured log file generator which can easily be tested](#logger)
- [**CSVLogger** can be used to log to a CSV file](#csvlogger)

## What is the difference between a flat and a complex object?

Complex objects are those which can contain other objects in one or more attributes.
Flat objects are those which only contain scalar attributes.

## `diff()`

Allows to compare objects for changes. Written in Typescript and works for CJS and ESM.

It returns an object containing only the differing properties, even in deeper nested structures.
It can be configured to include the values from either object or even both.

```ts
import { diff } from "useful-typescript-functions"

const result = diff(
  {
    prop: 1,
    date: new Date("2022-10-15T07:43:00"),
  },
  {
    prop: 2,
    date: new Date(),
  }
)
```

Returns (at least as of writing this example here in UTC+2):

```ts
{
  prop: { from: 1, to: 2 },
  date: { from: 2022-10-15T05:43:00.000Z, to: 2022-10-15T05:48:03.502Z }
}
```

To include only the previous values, add a third parameter to `diff`:

```ts
const from = diff({ prop: 1 }, { prop: 2 }, "from")
// -> { prop: 1 }
const to = diff({ prop: 1 } { prop: 2 }, "to")
//{ prop: 2 }
```

If there are no differences between the two objects, the returned value is an empty object.

See some more examples in the [tests](./src/diff.test.ts), and have a [look at the code](./src/diff.ts) for the comment blocks of `diff()`.

## `flatten()`

This function flattens an deeply nested object to one level. The 'paths' of the original nesting level are conserved as new property names like in the following example:

```ts
import { flatten } from "useful-typescript-functions"

const flatted = flatten({
  shallow: 1,
  deep: {
    deeper: {
      property: "abc",
    },
  },
})
// ->  { shallow: 1, 'deep.deeper.property': 'abc' }
```

## `inflate()`

This function is the opposite of `flatten()`. It takes an object in the form of the result of `flatten()` and creates a new object, containing all necessary nesting levels:

```ts
import { inflate } from "useful-typescript-functions"

const inflated = inflate({ shallow: 1, "deep.deeper.property": "abc" })
// -> { shallow: 1, deep: { deeper: { property: 'abc' }}}
```

## `objectContains()`

Deep compare two object a and b in a way that all properties with values from b must be also in a. Other properties/values of a are ignored.

```ts
import { objectContains } from "useful-typescript-functions"

console.log(objectContains({ a: 1, b: "c" }, { b: "d" }))
// -> false
console.log(objectContains({ a: 1, b: "c" }, { a: 1 }))
// -> true
```

## `objectContaining()`

Returns an asymmetricMatcher object which helps comparing the given object with other objects.

```ts
import { objectContaining } from "useful-typescript-functions"

const matcher = objectContaining({ b: "c" })
console.log(matcher({ a: 1, b: "c" }))
// -> true
```

## `renameAttribute()`

Rename an attribute in an object. This higher level function returns a mapper which can be used in an `Array.map()` call:

```ts
import { renameAttribute } from "useful-typescript-functions"

const users = [{ name: "john" }, { name: "arnold" }]
const mappedUsers = users.map(renameAttribute("name", "firstName"))
// -> [{ firstName: "john" }, { firstName: "arnold" }]
```

## `getMutation`

Returns an object containing allowed changes to an original object.
It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.

```ts
import { getMutation } from "useful-typescript-functions"

const original = { mutable: 1, immutable: 2 }
const change = { mutable: 3, immutable: 4, other: 5 }

const mutation = getMutation(original, ["mutable"], change)
// -> { mutable: 3 }
```

## `mutate`

Changes an object regarding only some attributes from another object:

```ts
import { mutate } from "useful-typescript-functions"

const original = { mutable: 1, immutable: 2 }
const change = { mutable: 3, immutable: 4, other: 5 }

const mutated = mutate(original, ["mutable"], change)
// -> { mutable: 3, immutable: 2 }
```

Mutable attributes cannot be mutated to undefined, but it is possible to set them to null.
This enables usage for updating database entities.

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

### Usage in a program:

```ts
import { Logger } from "useful-typescript-functions"

const logger = Logger()

logger.debug("test")
logger.info({ message: "structured log data", source: "this program" })

logger.setGlobal({ info: "global information" })
logger.error("an error occured")
```

results in

```JSON
{"level":"debug","message":"test"}
{"level":"info","message":"structured log data","source":"this program"}
{"level":"error","message":"an error occured","info":"global information"}
```

### Usage in a test:

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

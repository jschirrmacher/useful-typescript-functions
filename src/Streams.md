# Streams

Use streams to read lines from a file, JSONL or CSV files.

This looks like:

```ts
import { createReadableStream } from "stream"
import { createLineTransform } from "useful-typescript-functions"

createReadableStream("my-file.txt").pipe(createLineTransform()).on("data", line => console.log(line + "\n"))

// line 1
// line 2
```

This helps if you have large files and want to handle line by line.

## Reading CSV to an array of objects

It is also possible to handle lines of an CSV file one by one by using the `createCSV2ObjectTransform()` function. It works as another pipeline step, just after `createLineTransform()`.

Sometimes, it is desirable to read all data to an array. To do this, you can use `streamToArray()`, which collects the stream until its end. This way, reading in a CSV file looks like this:

```ts
import { createReadableStream } from "stream"
import { createLineTransform, streamToArray } from "useful-typescript-functions"

const pipeline = createReadableStream("my-csv-file.csv")
  .pipe(createLineTransform())
  .pipe(createCSV2ObjectTransform())

console.log(await streamToArray(pipeline))
```

A CSV file like this:

```text
level,area,other
42,52,abc
52,42,def
```

would result in this:

```ts
[
  { level: 42, area: 52, other: "abc" },
  { level: 52, area: 42, other: "def" }
]
```

`createCSV2ObjectTransform()` accepts an optional parameter `separator` which is useful if your CSV file uses a different field separator than the normal comma (as in _Comma_ separated fields), like it is used by MS Excel.

## Creating CSV output

Transform streams can also be used to create CSV files. To do so, you can use `createObject2CSVTransform()`. The transform takes objects, and writes lines containing JSON data plus an terminating newline. These entries can then be written to a file. This function also accepts an optional `separator` parameter. Additionally, you can specify a list of field names which are used as titles. If you don't specify the fields explicitly (omit the parameter), the fields of the first given object are used as titles.

## Reading and writing JSONL

JSONL or 'JSON lines' is a format which has JSON data in each line.

Functions `createJSONL2ObjectTransform()` and `createObject2JSONLTransform()` creates transforms to parse or generate such lines containing JSON. It can be used just like the CSV transforms.

# Streams

Use streams to read and write data from text files, JSONL files, CSV files, or from or to a Kafka stream or write to a database table.

With a CSV file that looks like:

```csv
level,area,other
42,52,abc
52,42,def
```

and a program like this:

```ts
import { createCSVSource } from "useful-typescript-functions"

const pipeline = createCSVSource({ path: "my-file.csv" }).run()
pipeline.stream.on("data", line => console.log(line))
```

The result would be:

```json
{ level: 42, area: 52, other: "abc" }
{ level: 52, area: 42, other: "def" }
```

There is a function `run()` on the pipeline object returned from `createCSVSource` to make it possible to actually read the file only on demand. This makes it possible to set up more complex data pipelines, which have multiple input streams. With `run()` you are in control when each stream should start processing events.`

If you have large files and want to handle line by line, streams also helps use less memory, because you can handle it line by line.

## Reading CSV to an array of objects

It is also possible to handle lines of an CSV file one by one by using the `createCSV2ObjectTransform()` function. It works as another pipeline step, just after `createLineTransform()`.

Sometimes, it is desirable to read all data to an array. To do this, you can use `streamToArray()`, which collects the stream until its end. This way, reading in a CSV file looks like this:

```ts
import { createCSVSource, streamToArray } from "useful-typescript-functions"

const pipeline = createCSVSource({ path: "my-file.csv" }).run()

console.log(await streamToArray(pipeline.stream))
```

With a CSV file like above it would result in this:

```json
[
  { "level": 42, "area": 52, "other": "abc" },
  { "level": 52, "area": 42, "other": "def" }
]
```

`createCSVSource()` accepts an option `separator` which is useful if your CSV file uses a different field separator than the normal comma (as in "_comma_ separated values"), like it is used by MS Excel.

```ts
createCSVSource({ path: "my-file.csv", separator: ";" })
```

Also, you can select the fields from the file explicitly by specifying an option `fields` containing the field names in the csv file that should be included in the resulting objects. All other fields are ignored.

```ts
createCSVSource({ path: "my-file.csv", fields: ["area", "other"] })
```

results in

```json
[
  { "area": 52, "other": "abc" },
  { "area": 42, "other": "def" }
]
```

## Creating CSV output

Streams can also be used to create CSV files. To do so, you can use `createCSVSink()`. It takes objects and writes lines containing CSV data plus an terminating newline into a file specified by either a `path` option, or to the `writeStream` option.

The sink creation function also accepts an optional `separator` parameter. Additionally, you can specify a list of field names in `fields`, which are used as titles. If you don't specify the fields explicitly (omit the parameter), the fields of the first given object are used as titles.

The following example is a program to convert the CSV file from above to another CSV file, compatible with Excel, and containing only two of the three fields:

```ts
import { createCSVSource, createCSVSink } from "useful-typescript-functions"

const pipeline = createCSVSource({ path: "./my-file.csv" })
pipeline.stream.pipe(
  createCSVSink({ path: "output.csv", separator: ";", fields: ["other", "area"] }),
)
pipeline.run()
```

This is the content of the resulting `output.csv` file:

```csv
other;area
abc;52
def;42
```

## Reading and writing JSONL

JSONL or 'JSON lines' is a format which has JSON data in each line.

Functions `createJSONLSource()` and `createJSONLSink()` creates sources and sinks to parse or generate such lines containing JSON. It can be used just like the CSV sources and sinks.

## Sink into an array

It is possible to collect all messages from the stream in an array. To do this, call `createArraySink()` and give it an array as its parameter:

```ts
const result: string[] = []
await new Promise(resolve => {
  createCSVSource({ path: "./my-file.csv" })
    .run()
    .stream.pipe(createArraySink(result))
    .on("close", resolve)
})
```

There is also a conveniance function `streamToArray()` which gets a `Readable` stream as parameter and can be `await`ed and will be resolved only if the stream is closed. The result is an array with all collected events.

With this function, the above code reduces to this:

```ts
const result = await streamToArray(createCSVSource({ path: "./my-file.csv" }).run().stream)
```

## Sink into a database table

If you want to store data from a stream into a database table, use the `DatabaseSink`. It makes use of a [TypeORM](https://typeorm.io/) database connection, so you need to create a dependency to it.

The creator function `createDatabaseSink()` accepts up to four parameters:

- **dataSource** is the DataSource of a TypeORM
- **entity** the Entity class the data should be sinked to
- **keyFunc** a function returning a where condition to identify existing entries in the database table
- **append** is an optional parameter, which can be set to `true` to always append to the table instead of updating an existing entry, identified by the where condition returned by the `keyFunc`.

In the following example we read data from a csv file which contains vehicles with an id and geo coordinates and store it a database table, always updating existing vehicles (identified by their Id). Entries for yet unknown vehicles are inserted, known vehicles are updated.

```ts
function getKey(vehicle: VehicleEntity) {
  return { vehicleId: vehicle.id }
}

createCSVSource({ path: "./vehicle-data.csv" })
  .run()
  .stream.pipe(createDatabaseSink(dataSource, VehicleEntity, getKey))
```

There is also a function `getDataSource()` which gets a `ormConfig` parameter of type `DataSourceOptions` and returns a `DataSource`, importing TypeORM, initializes the connection and shows the migration status. This is only for convenience, you can always write your own function to get the `DataSource` you need for creating a DatabaseSink.

## KafkaSource

Read from a Kafka topic into a stream with the KafkaSource, which is created with the exported `createKafkaSource()` function. It gets a Kafka.js Kafka connection, a consumer group id, a topic name and an optional `OffsetProvider`.

```ts
const pipeline = createKafkaSource(kafka, "my-group-id", "my-topic").run()

console.log(await streamToArray(pipeline.stream))
```

The optional `OffsetProvider` parameter can be used to define how Kafka events are read from the topic. You can use one of the predefined providers, or you can provider your own (which most likely will be a [KeyedState](#keyedState)):

- **startFromTopicStart** - This predefined provider is used to read events starting from the beginning of the Kafka topic
- **startFromTopicEnd** - This provider is also predefined, and is the default, if you omit the parameter. It advises the KafkaSource to read only newly incoming events, and no historical ones
- **any own `OffsetProvider`** - an object implementing the `OffsetProvider` interface, which lets the KafkaSource set and get offsets for partitions. This will most likely a [KeyedState](#keyedState)

A `KafkaSource` also has another function, `runWithHeadstart()` which is used to start processing events coming from the source, and resolves a promise when the events in the stream cease to flow for a given time period. This helps in replay scenarios with streams needed for slow changing data, but references by data in other streams. The events from the headstarted stream will already be in the state when events from the other stream arrive.

## KeyedState

This is a object to store and retrieve keyed state from a database. To use it, you need [TypeORM](https://typeorm.io/) as a dependency, and allows to store state of keyed data. Keyed data means data which is distinguished by a unique key. State could be persons, vehicles, fruit or whatever you need. Each person, vehicle or fruit needs to have an unique key. However, you can use the same key for persons and vehicles, as long as each type has its own `KeyedState`. The `KeyedState`s also have an id.

States are automatically persisted in the database after at latest one minute or if `saveAllCheckpoints()` is called, which should be done when the process is receiving a `SIGINT` signal. This prevents a high load on the database when a lot of events of a `KafkaStream` are evaluated and reduced to a state.

Create a new `KeyedState` like this:

```ts
interface Person {
  id: string
  firstName: string
  lastName: string
  birthDate: Date
}

function keyFunc(person: Person) {
  return person.id
}

const personState = await createState<Person>("person", dataSource, keyFunc, true)
```

`Person` is the type of your single state, which will be identified by a key. The `KeyedState` has an own identifier specified as the first parameter (in this example "person"). With this identifier it is possible to use multiple `KeyedStates` with possibly the same state keys.

The `dataSource` is the TypeORM `DataSource` - your connection to the database.

With `keyFunc` you specify a function to retrieve the state's key from one of the single states. It needs to be a string.

The boolean parameter `withoutCheckpoint` (`true` in this example) specifies if the latest persisted checkpoint is to be used (`false`, the default) or not, so that the previously stored state is discarded. This might be useful if you read a Kafka topic starting from its beginning.

The `KeyedState` implements the `OffsetProvider` interface and can directly be used when creating the `KafkaSource`.

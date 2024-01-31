# Useful TypeScript Functions

A dependency-free collection of useful functions for applications in TypeScript. (Actually, you need some peer libraries if you use some of the functions). Written in Typescript and works for CJS and ESM.

- [**Objects** for working with objects](src/Objects.md)
- [**Functions** run asynchronous functions one after each other](src/Functions.md)
- [**Logger** a structured log file generator which can easily be tested](src/Logger.md)
- [**Server** to simplify creation of express.js servers and routers](src/Server.md)
- [**Files** to help handle files, especially image previews](src/Files.md)
- [**Mailer** for sending html templated emails easily](src/Mailer.md)
- [**Streams** for easier handling of streams of data](src/Streams.md)

## Upgrade from version 3

Version 4 of `useful-typescript-functions` only works with ESM.

## Upgrade from version 2

There are some breaking changes of version 3.

- If you use `Server`, you should have a look into the [this upgrade info](src/Server.md#upgrading-from-version-2).
- Previously deprecated functions `flattenObject()` and `inflateObject()` are now removed. You now need to move to `flatten` and `inflate()` now.
- Instead of using `CSVLogger` to read and write CSV files, you should now use `Streams` module and its CSV related transforms.
- The `CSVLogger` module is now removed in favour of using `Logger` and its function `createCSVTransport()`. Read about that [here](src/Logger.md#set-an-alternative-transport-with-settransport)

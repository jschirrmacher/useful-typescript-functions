## Files helper

Some functions to ease handling of files, and especially image files.

```ts
import { Files } from "useful-typescript-functions"
import sharp from "sharp"

const { mkdir, getProjectDir, getPreview } = Files({ sharp })
```

`sharp` is only a required parameter to `Files`, if you want to use `getPreview()`. If not, you may omit the parameter.

### `mkdirp(path: string)`

Makes sure a file path exists and creates it, if it doesn't. Would be easy to use a standard file system call instead - just if you would remember which option to use.

### `getProjectDir(envName: string, ...path: string[])`

Returns the resolved absolute path relative to the current working directory - if the specified environment variable is not set. If it is, this value is used as the path instead. This allows to override the normally used path to access a file.

`getProjectDir()` also creates the path, if it doesn't yet exist.

### `getPreview(folder: string, name: string, mimetype: string, options: SizeOptions)`

> Remember to specify the sharp library to use when instantiating the `Files` factory function.

Returns a data URL containing a preview image of the given image file. Preview images are cached in the local file system, so the next call with the same parameters will return the very same preview image, but a lot faster.

Currently, jpeg, png and gif images are supported.

The `options` can be used to define, how the preview image looks like. See [sharp.js documentation on `resize`](https://sharp.pixelplumbing.com/api-resize) which options exist.

### `readJSON(fileWithPath: string)`

Reads in a JSON file and parses strings that look like ISO dates as Date objects.

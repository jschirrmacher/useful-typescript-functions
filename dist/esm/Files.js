import origFs from "fs/promises";
import { resolve, join } from "path";
const allowedSizeOptions = ["width", "height", "fit", "position", "kernel"];
const isoDatePattern = /(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\d[Tt\s][0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
export function getPreviewFolder(options) {
    return ("preview_" +
        Object.keys(options)
            .filter(k => allowedSizeOptions.includes(k))
            .sort((a, b) => a.localeCompare(b))
            .map(k => options[k])
            .join("_")
            .replace(/\s+/g, "-"));
}
export function Files({ sharp, fs } = {}) {
    const { mkdir, readFile, writeFile } = fs || origFs;
    const helper = {
        async mkdirp(path) {
            await mkdir(path, { recursive: true });
        },
        async getProjectDir(envName, ...path) {
            const resolved = process.env[envName] || resolve(process.cwd(), ...path);
            await helper.mkdirp(resolved);
            return resolved;
        },
        getDataUrl(mimetype, data) {
            return "data:" + mimetype + ";base64," + data.toString("base64");
        },
        async getPreview(folder, name, mimetype, options) {
            const previewFolder = getPreviewFolder(options);
            await helper.mkdirp(join(folder, previewFolder));
            const previewFileName = join(folder, previewFolder, name);
            try {
                return helper.getDataUrl(mimetype, await readFile(previewFileName));
            }
            catch (error) {
                if (sharp) {
                    const data = await sharp(join(folder, name)).resize(options).toBuffer();
                    writeFile(previewFileName, data, "binary");
                    return helper.getDataUrl(mimetype, data);
                }
                return undefined;
            }
        },
        async readJSON(fileWithPath) {
            const content = await readFile(fileWithPath);
            return JSON.parse(content.toString(), (_, value) => {
                if (typeof value === "string" && value.match(isoDatePattern)) {
                    return new Date(value);
                }
                return value;
            });
        },
    };
    return helper;
}
//# sourceMappingURL=Files.js.map
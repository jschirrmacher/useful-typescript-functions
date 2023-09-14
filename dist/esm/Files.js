import origFs from "fs/promises";
import { resolve, join } from "path";
const allowedSizeOptions = ["width", "height", "fit", "position", "kernel"];
export function getPreviewFolder(options) {
    return ("preview_" +
        Object.keys(options)
            .filter(k => allowedSizeOptions.includes(k))
            .sort((a, b) => a.localeCompare(b))
            .map(k => options[k])
            .join("_")
            .replace(/\s+/g, "-"));
}
export function FileHelper({ sharp, fs } = {}) {
    const { mkdir, readFile, writeFile } = (fs || origFs);
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
    };
    return helper;
}
//# sourceMappingURL=Files.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jpg = void 0;
const vitest_1 = require("vitest");
const Files_1 = require("./Files");
const hexToBuffer = (hex) => new Uint8Array(hex.match(/.{2}/g)?.map(hexPair => parseInt(hexPair, 16)) || []);
exports.jpg = hexToBuffer("ffd8ffdb004300" +
    "01".repeat(64) +
    "ffc2000b080001000101011100ffc400140001" +
    "00".repeat(15) +
    "03ffda00080101000000013Fffd9");
const yaml = `publicTest: 42
secrets: 
  - mySecret: 24
`;
function mockFs() {
    return {
        mkdir: vitest_1.vi.fn(),
        readFile: vitest_1.vi.fn().mockImplementation(name => {
            if (name === "/tmp/gallery/preview_20/123_file-1.jpg") {
                return Promise.resolve(exports.jpg);
            }
            else if (name === "config.yaml") {
                return Promise.resolve(yaml);
            }
            else {
                throw { code: "ENOENT" };
            }
        }),
        writeFile: vitest_1.vi.fn(),
    };
}
function sharp() {
    const instance = {
        resize() {
            return instance;
        },
        toBuffer() {
            return Promise.resolve(Buffer.alloc(1));
        },
    };
    return instance;
}
(0, vitest_1.describe)("Files", () => {
    (0, vitest_1.describe)("mkdirp()", () => {
        const fs = mockFs();
        const { mkdirp } = (0, Files_1.Files)({ fs });
        (0, vitest_1.it)("should call fs.mkdir() with 'recursive=true'", async () => {
            await mkdirp("test/abc");
            (0, vitest_1.expect)(fs.mkdir).toBeCalledWith("test/abc", vitest_1.expect.objectContaining({ recursive: true }));
        });
    });
    (0, vitest_1.describe)("getProjectDir()", () => {
        const fs = mockFs();
        const { getProjectDir } = (0, Files_1.Files)({ fs });
        (0, vitest_1.beforeEach)(() => {
            delete process.env.TEST;
        });
        (0, vitest_1.it)("should use the environment variable", async () => {
            process.env.TEST = "/abc";
            (0, vitest_1.expect)(await getProjectDir("TEST", "def")).toEqual("/abc");
        });
        (0, vitest_1.it)("should fall back to the given path", async () => {
            (0, vitest_1.expect)(await getProjectDir("TEST", "def")).toEqual(process.cwd() + "/def");
        });
        (0, vitest_1.it)("should create the folder if it doesn't exist", async () => {
            await getProjectDir("TEST", "ghi");
            (0, vitest_1.expect)(fs.mkdir).toBeCalledWith(process.cwd() + "/ghi", { recursive: true });
        });
    });
    (0, vitest_1.describe)("getPreview()", () => {
        const fs = mockFs();
        const { getPreview } = (0, Files_1.Files)({ fs, sharp });
        fs.readFile.mockImplementation((name) => {
            if (name.match(/\/preview_/)) {
                throw `${name} not found`;
            }
            else {
                return exports.jpg;
            }
        });
        (0, vitest_1.it)("should create a preview if it doesn't yet exist", async () => {
            await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", { width: 20 }),
                (0, vitest_1.expect)(fs.writeFile).toBeCalledWith("/tmp/gallery/preview_20/123_file-1.jpg", vitest_1.expect.any(Buffer), "binary");
        });
        (0, vitest_1.it)("should return a newly created preview image", async () => {
            const preview = await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", {
                width: 20,
            });
            (0, vitest_1.expect)(preview).toMatch(/^data:image\/jpg;base64,/);
        });
        (0, vitest_1.it)("should return an existing preview image", async () => {
            fs.readFile.mockResolvedValue(exports.jpg);
            const preview = await getPreview("/tmp/gallery/", "123_file-1.jpg", "image/jpg", {
                width: 20,
            });
            (0, vitest_1.expect)(preview).toMatch(/^data:image\/jpg;base64,/);
        });
    });
    (0, vitest_1.describe)("getPreviewFolder()", () => {
        (0, vitest_1.it)("should return a folder matching the options", () => {
            (0, vitest_1.expect)((0, Files_1.getPreviewFolder)({ width: 20 })).toEqual("preview_20");
            (0, vitest_1.expect)((0, Files_1.getPreviewFolder)({ height: 40 })).toEqual("preview_40");
            (0, vitest_1.expect)((0, Files_1.getPreviewFolder)({ width: 30, height: 40 })).toEqual("preview_40_30");
            (0, vitest_1.expect)((0, Files_1.getPreviewFolder)({ width: 30, fit: "inside" })).toEqual("preview_inside_30");
        });
    });
    (0, vitest_1.describe)("readJSON", () => {
        const testData = [
            ["2023-10-22T09:20:00.123Z", new Date("2023-10-22T09:20:00.123Z")],
            ["2023-10-22T11:20:00.123+02:00", new Date("2023-10-22T09:20:00.123Z")],
            ["2023-10-22T09:20:00Z", new Date("2023-10-22T09:20Z")],
            ["2023-10-22T09:20Z", new Date("2023-10-22T09:20Z")],
        ];
        testData.forEach(([dateString, expected]) => {
            (0, vitest_1.it)(`should parse "${dateString}" to ${expected.toISOString()}`, async () => {
                const fs = mockFs();
                fs.readFile.mockResolvedValue(JSON.stringify({ value: dateString }));
                const { readJSON } = (0, Files_1.Files)({ fs });
                (0, vitest_1.expect)(await readJSON("test.json")).toEqual({ value: expected });
            });
        });
        (0, vitest_1.it)("should not convert attributes not matching the ISO pattern", async () => {
            const fs = mockFs();
            fs.readFile.mockResolvedValue(JSON.stringify({ s: "abc", n: 123 }));
            const { readJSON } = (0, Files_1.Files)({ fs });
            (0, vitest_1.expect)(await readJSON("test.json")).toEqual({ s: "abc", n: 123 });
        });
    });
    function setupConfig() {
        return (0, Files_1.Files)({ fs: mockFs() });
    }
    (0, vitest_1.describe)("readYAML", () => {
        (0, vitest_1.it)("should return the content of the file", async () => {
            const { readYAML } = setupConfig();
            (0, vitest_1.expect)(await readYAML("config.yaml")).toEqual({
                publicTest: 42,
                secrets: [{ mySecret: 24 }],
            });
        });
        (0, vitest_1.it)("should throw an error if the file doesn't exist", async () => {
            const { readYAML } = setupConfig();
            await (0, vitest_1.expect)(readYAML("other.yaml")).rejects.toEqual({ code: "ENOENT" });
        });
    });
    (0, vitest_1.describe)("readConfig", () => {
        (0, vitest_1.it)("should only return the public content", async () => {
            const { readConfig } = setupConfig();
            (0, vitest_1.expect)(await readConfig("config.yaml")).toEqual({ publicTest: 42 });
        });
        (0, vitest_1.it)("should not include secrets", async () => {
            const { readConfig } = setupConfig();
            (0, vitest_1.expect)(await readConfig("config.yaml")).not.toHaveProperty("secrets");
        });
        (0, vitest_1.it)("should return the default content if the file doesn't exist", async () => {
            const { readConfig } = setupConfig();
            (0, vitest_1.expect)(await readConfig("other.yaml")).toEqual({ isDefault: true });
        });
    });
});
//# sourceMappingURL=Files.test.js.map
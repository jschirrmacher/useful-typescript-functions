import origFs from "fs/promises";
type FileSystem = Pick<typeof origFs, "readFile" | "writeFile" | "mkdir">;
type SizeOptions = {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    position?: "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top";
};
type SharpOperations = {
    resize(options: SizeOptions): SharpOperations;
    toBuffer(): Promise<Buffer>;
};
export type SharpLib = (path: string) => SharpOperations;
export declare function getPreviewFolder(options: SizeOptions): string;
export declare function Files({ sharp, fs }?: {
    sharp?: SharpLib;
    fs?: FileSystem;
}): {
    mkdirp: (path: string) => Promise<void>;
    getProjectDir: (envName: string, ...path: string[]) => Promise<string>;
    getDataUrl: (mimetype: string, data: Buffer) => string;
    getPreview: (folder: string, name: string, mimetype: string, options: SizeOptions) => Promise<string | undefined>;
    readJSON: (fileWithPath: string) => Promise<unknown>;
    readYAML: <T>(fileWithPath: string) => Promise<T>;
    /**
     * Read YAML configuration file.
     *
     * @param fileWithPath Path and name of configuration file in YAML format
     * @param withoutSecrets deletes a possibly existing `secrets` entry, defaults to true
     * @returns
     */
    readConfig: <T>(fileWithPath: string, withoutSecrets?: boolean) => Promise<T | {
        isDefault: boolean;
    }>;
};
export {};

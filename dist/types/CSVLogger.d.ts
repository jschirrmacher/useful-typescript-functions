/// <reference types="node" />
import fs from "fs";
import { LogStruct } from "./Logger";
export type FileSystem = Pick<typeof fs, "appendFileSync" | "existsSync" | "readFileSync" | "statSync" | "writeFileSync">;
export declare function CSVLogger(fileName: string, fields?: string[]): {
    read(): any[];
    append(data: Record<string, unknown>): void;
    getTransport(): (data: LogStruct) => void;
    injectFileSystem(fileSystem: FileSystem): void;
};
export default CSVLogger;

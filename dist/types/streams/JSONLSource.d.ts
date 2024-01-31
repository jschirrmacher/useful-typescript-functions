/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { Readable } from "stream";
interface JSONLSourceOptions {
    readStream?: Readable;
    path?: PathLike;
}
export declare function createJSONLSource<T>(options: JSONLSourceOptions): {
    stream: Readable;
    run(): any;
};
export {};

import { PathLike } from "fs";
import { Readable } from "stream";
interface JSONLSourceOptions {
    readStream?: Readable;
    path?: PathLike;
}
export declare function createJSONLSource<T>(options: JSONLSourceOptions): {
    stream: Readable;
    run(): {
        stream: Readable;
        run(): /*elided*/ any;
    };
};
export {};

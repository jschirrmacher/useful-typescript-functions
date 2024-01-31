/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { Transform, Writable } from "stream";
interface JSONLSinkOptions {
    writeStream?: Writable;
    path?: PathLike;
}
export declare function createJSONLSink(options: JSONLSinkOptions): Writable;
/**
 * Creates a Transform to create JSON lines from objects.
 * @deprecated Use `createJSONLSink()` instead.
 *
 * @returns the new Transform
 */
export declare function createObjectToJSONLTransform(): Transform;
export {};

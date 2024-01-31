/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { Transform, Writable } from "stream";
interface CSVSinkOptions {
    writeStream?: Writable;
    path?: PathLike;
    separator?: string;
    fields?: string[];
}
export declare function createCSVSink(options: CSVSinkOptions): Writable;
/**
 * Creates a Transform to create CSV lines from objects.
 * @deprecated Use `createCSVSink()` instead.
 *
 * @param separator can be specified to use another field separator than the standard ','
 * @param predefinedFields optionally specify the fields to read from. If omitted, uses all fields from the first object in the stream.
 * @returns the new Transform
 */
export declare function createObject2CSVTransform(separator?: string, predefinedFields?: string[]): Transform;
export {};

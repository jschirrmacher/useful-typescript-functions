/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { Readable, Transform } from "stream";
interface CSVSourceOptions {
    readStream?: Readable;
    path?: PathLike;
    separator?: string;
    fields?: string[];
}
export declare function createCSVSource<T>(options: CSVSourceOptions): {
    stream: Readable;
    run(): any;
};
declare function createCSVTransform(separator?: string, fields?: string[]): Transform;
/**
 * Create a Transform that converts CSV lines to objects.
 * @deprecated Use CSVSource instead
 *
 * @param separator optional separator, defaults to ',' if not specified.
 * @param fields optional list of fields. If not set, it takes the first line in the stream as the field names.
 * @returns the new Transform
 */
export declare const createCSV2ObjectTransform: typeof createCSVTransform;
export {};

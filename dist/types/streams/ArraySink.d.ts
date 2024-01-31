/// <reference types="node" />
import { Readable, Writable } from "stream";
export declare function createArraySink<T>(sink: T[]): Writable;
export declare function streamToArray<T>(readable: Readable): Promise<T[]>;

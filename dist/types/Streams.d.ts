/// <reference types="node" />
import { Transform, Writable } from "stream";
export declare function createLineTransform(): Transform;
export declare function createJSONL2ObjectTransform(): Transform;
export declare function createObjectToJSONLTransform(): Transform;
export declare function createCSV2ObjectTransform(separator?: string, fields?: string[]): Transform;
export declare function createObject2CSVTransform(separator?: string, predefinedFields?: string[]): Transform;
export declare function createArraySink<T>(sink: T[]): Writable;
export declare function streamToArray<T>(writable: Writable): Promise<T[]>;
export declare function createObjectStream(): Transform;

/// <reference types="node" />
import { Transform } from "stream";
export * from "./streams/CSVSink.js";
export * from "./streams/CSVSource.js";
export * from "./streams/JSONLSink.js";
export * from "./streams/JSONLSource.js";
export * from "./streams/ArraySink.js";
export * from "./streams/DatabaseSink.js";
export * from "./streams/KafkaSource.js";
export * from "./streams/KeyedState.js";
export * from "./streams/LineTransform.js";
export * from "./streams/OffsetProvider.js";
export * from "./streams/KeyedStateEntity.js";
export * from "./streams/KeyedStateMigration.js";
/**
 * @deprecated use the several sink modules instead.
 */
export declare function createObjectStream(): Transform;

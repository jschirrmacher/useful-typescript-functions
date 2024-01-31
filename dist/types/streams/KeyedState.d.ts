/// <reference types="node" />
/// <reference types="node" />
import { OffsetProvider } from "./OffsetProvider.js";
import { DataSource } from "typeorm";
interface Checkpointable {
    saveCheckpoint(): Promise<void>;
}
export type State<T> = OffsetProvider & Checkpointable & {
    getByKey(key: string): T;
    set(object: T, offset?: string, partition?: number): void;
    unset(object: T, offset?: string, partition?: number): void;
};
type Logger = Pick<typeof console, "info" | "warn">;
type KeyFunc<T> = (object: T) => string;
export declare function createState<T>(id: string, dataSource: DataSource, keyFunc: KeyFunc<T>, withoutCheckpoint?: boolean, logger?: Logger): Promise<State<T>>;
export declare function saveAllCheckpoints(): Promise<void>;
export {};

/// <reference types="node" />
import { Writable } from "stream";
import type { DataSource, DataSourceOptions, EntityTarget, FindOptionsWhere, ObjectLiteral } from "typeorm";
type KeyFunc<T extends ObjectLiteral> = (obj: T) => FindOptionsWhere<T>;
export declare function getDataSource(ormConfig: DataSourceOptions): Promise<DataSource>;
export declare function createDatabaseSink<T extends ObjectLiteral>(dataSource: DataSource, entity: EntityTarget<T>, keyFunc: KeyFunc<T>, append?: boolean): Writable;
export {};

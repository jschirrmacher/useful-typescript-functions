import { ObjectLiteral } from "typeorm";
export declare class KeyedStateEntity implements ObjectLiteral {
    id: string;
    key: string;
    state: string;
    constructor(id?: string, key?: string, state?: string);
}

import { StringIndexableObject } from "./types.js";
export declare function objectContains(obj1: StringIndexableObject, contains: StringIndexableObject): boolean;
export declare function objectContaining(contains: StringIndexableObject): {
    asymmetricMatch(obj: StringIndexableObject): boolean;
};

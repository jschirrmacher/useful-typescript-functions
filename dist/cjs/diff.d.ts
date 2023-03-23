import { StringIndexableObject } from "./types";
/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param to modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
export declare function diff(from: StringIndexableObject, to: StringIndexableObject, include?: "from" | "to" | "both"): StringIndexableObject;

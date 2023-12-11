import { Arrayized, BaseType, StringIndexableObject } from "./types.js";
/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be destructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export declare function arrayize(obj: BaseType | StringIndexableObject): Arrayized[];
/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting levels.
 *
 * @param obj original, deeply nested object
 * @returns flat object of only one level, but with property names containing paths of the original object
 */
export declare function flatten(obj: BaseType | StringIndexableObject): StringIndexableObject;
/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export declare function inflate(obj: StringIndexableObject): StringIndexableObject;
/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param other modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
export declare function diff(from: StringIndexableObject, other: StringIndexableObject, include?: "from" | "to" | "both"): StringIndexableObject;
/**
 * Checks if an object contains another one.
 *
 * @param object object to compare
 * @param other object which might be contained in first object
 * @returns true if the current object contains the other one.
 */
export declare function objectContains(object: StringIndexableObject, other: StringIndexableObject): boolean;
export declare function objectContaining(contains: StringIndexableObject): {
    asymmetricMatch(obj: StringIndexableObject): boolean;
};
/**
 * Rename an attribute in an object. This higher level function returns a mapper which can be used
 * in an `Array.map()` call. Example:
 *
 *     const mappedUsers = users.map(renameAttribute("name", "firstName"))
 *
 * @param from previous name of attribute
 * @param to new name of attribute
 * @returns (obj: Record<string, unknown>) => T
 */
export declare function renameAttribute<T extends object>(from: string, to: keyof T): (obj: Record<string, unknown>) => T;
/**
 * Returns an object containing allowed changes to an original object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns Object containing allowed changes to an original object
 */
export declare function getMutation<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>): any;
/**
 * Mutates an object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns The mutated object
 */
export declare function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>): any;
/**
 * Extract properties with values from an object.
 *
 * @param obj
 * @param props
 * @returns new object with the extracted properties with values
 */
export declare function extract<T extends object>(obj: T, props: (keyof T)[]): {
    [k: string]: T[keyof T];
};
export declare function createObject<T extends StringIndexableObject>(obj: T, writableAttributes?: Array<keyof T>): any;

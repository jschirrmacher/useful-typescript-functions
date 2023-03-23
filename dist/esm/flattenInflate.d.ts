import { Arrayized, BaseType, FlatObject, StringIndexableObject } from "./types";
/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be desctructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export declare function arrayize(obj: BaseType | StringIndexableObject): Arrayized[];
/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting levels.
 *
 * @param obj original, deeply nested object
 * @returns flat object of only one level, but with property names containing paths of the original object
 */
export declare function flatten(obj: BaseType | StringIndexableObject): FlatObject;
/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export declare function inflate(obj: FlatObject): StringIndexableObject;
/**
 * @deprecated use `flatten()` instead
 */
export declare const flattenObject: typeof flatten;
/**
 * @deprecated use `inflate()` instead
 */
export declare const inflateObject: typeof inflate;

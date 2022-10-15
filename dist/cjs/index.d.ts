declare type BaseType = string | number | boolean | null | undefined | Date;
export interface StringIndexableObject {
    [property: string]: BaseType | StringIndexableObject;
}
declare type Arrayized = [string, BaseType];
declare type FlatObject = Record<string, BaseType>;
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
export declare function flattenObject(obj: BaseType | StringIndexableObject): FlatObject;
/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export declare function inflateObject(obj: FlatObject): StringIndexableObject;
/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param to modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
export declare function diff(from: StringIndexableObject, to: StringIndexableObject, include?: "from" | "to" | "both"): StringIndexableObject;
export {};

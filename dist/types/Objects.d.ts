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
export declare function getMutation<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>): T;
/**
 * Mutates an object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns The mutated object
 */
export declare function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>): T;
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
export declare function createObject<T extends StringIndexableObject>(obj: T, writableAttributes?: Array<keyof T>): T & {
    /**
     * Find the differences to the given object.
     *
     * @param other object
     * @param include defines which values the result should include
     * @returns a new object containing only the properties which are modified with the original and the modified values.
     */
    diff(other: Partial<T>, include?: "from" | "to" | "both"): StringIndexableObject;
    /**
     * Checks if the current object contains another one.
     *
     * @param other object to compare with
     * @returns true if the current object contains the other one.
     */
    contains(other: Partial<T>): boolean;
    /**
     * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
     *
     * @returns List of paths with values in the given object
     */
    arrayize(): Arrayized[];
    /**
     * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
     *
     * @returns flat object of only one level, but with property names containing paths of the original object
     */
    flatten(): StringIndexableObject & {
        /**
         * Find the differences to the given object.
         *
         * @param other object
         * @param include defines which values the result should include
         * @returns a new object containing only the properties which are modified with the original and the modified values.
         */
        diff(other: Partial<StringIndexableObject>, include?: "from" | "to" | "both"): StringIndexableObject;
        /**
         * Checks if the current object contains another one.
         *
         * @param other object to compare with
         * @returns true if the current object contains the other one.
         */
        contains(other: Partial<StringIndexableObject>): boolean;
        /**
         * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
         *
         * @returns List of paths with values in the given object
         */
        arrayize(): Arrayized[];
        flatten(): StringIndexableObject & any;
        /**
         * Inflate a flattened object (with paths as property names) to a deeply nested object
         *
         * @returns Re-inflated object, which may contain a nesting structure.
         */
        inflate(): StringIndexableObject & any;
        /**
         * Mutates the object.
         * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
         *
         * @param changes An object with the attributes and values to change
         * @returns The mutated object
         */
        mutate(changes: Partial<StringIndexableObject>): StringIndexableObject;
        /**
         * Extract some properties of the object.
         * @param props
         * @returns a new object containing only the extracted properties and values.
         */
        extract(props: (string | number)[]): {
            [k: string]: BaseType | StringIndexableObject;
        } & {
            /**
             * Find the differences to the given object.
             *
             * @param other object
             * @param include defines which values the result should include
             * @returns a new object containing only the properties which are modified with the original and the modified values.
             */
            diff(other: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>, include?: "from" | "to" | "both"): StringIndexableObject;
            /**
             * Checks if the current object contains another one.
             *
             * @param other object to compare with
             * @returns true if the current object contains the other one.
             */
            contains(other: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>): boolean;
            /**
             * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
             *
             * @returns List of paths with values in the given object
             */
            arrayize(): Arrayized[];
            /**
             * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
             *
             * @returns flat object of only one level, but with property names containing paths of the original object
             */
            flatten(): StringIndexableObject & any;
            /**
             * Inflate a flattened object (with paths as property names) to a deeply nested object
             *
             * @returns Re-inflated object, which may contain a nesting structure.
             */
            inflate(): StringIndexableObject & any;
            /**
             * Mutates the object.
             * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
             *
             * @param changes An object with the attributes and values to change
             * @returns The mutated object
             */
            mutate(changes: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>): {
                [k: string]: BaseType | StringIndexableObject;
            };
            extract(props: (string | number)[]): {
                [k: string]: BaseType | StringIndexableObject;
            } & any;
        };
    };
    /**
     * Inflate a flattened object (with paths as property names) to a deeply nested object
     *
     * @returns Re-inflated object, which may contain a nesting structure.
     */
    inflate(): StringIndexableObject & {
        /**
         * Find the differences to the given object.
         *
         * @param other object
         * @param include defines which values the result should include
         * @returns a new object containing only the properties which are modified with the original and the modified values.
         */
        diff(other: Partial<StringIndexableObject>, include?: "from" | "to" | "both"): StringIndexableObject;
        /**
         * Checks if the current object contains another one.
         *
         * @param other object to compare with
         * @returns true if the current object contains the other one.
         */
        contains(other: Partial<StringIndexableObject>): boolean;
        /**
         * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
         *
         * @returns List of paths with values in the given object
         */
        arrayize(): Arrayized[];
        /**
         * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
         *
         * @returns flat object of only one level, but with property names containing paths of the original object
         */
        flatten(): StringIndexableObject & any;
        inflate(): StringIndexableObject & any;
        /**
         * Mutates the object.
         * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
         *
         * @param changes An object with the attributes and values to change
         * @returns The mutated object
         */
        mutate(changes: Partial<StringIndexableObject>): StringIndexableObject;
        /**
         * Extract some properties of the object.
         * @param props
         * @returns a new object containing only the extracted properties and values.
         */
        extract(props: (string | number)[]): {
            [k: string]: BaseType | StringIndexableObject;
        } & {
            /**
             * Find the differences to the given object.
             *
             * @param other object
             * @param include defines which values the result should include
             * @returns a new object containing only the properties which are modified with the original and the modified values.
             */
            diff(other: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>, include?: "from" | "to" | "both"): StringIndexableObject;
            /**
             * Checks if the current object contains another one.
             *
             * @param other object to compare with
             * @returns true if the current object contains the other one.
             */
            contains(other: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>): boolean;
            /**
             * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
             *
             * @returns List of paths with values in the given object
             */
            arrayize(): Arrayized[];
            /**
             * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
             *
             * @returns flat object of only one level, but with property names containing paths of the original object
             */
            flatten(): StringIndexableObject & any;
            /**
             * Inflate a flattened object (with paths as property names) to a deeply nested object
             *
             * @returns Re-inflated object, which may contain a nesting structure.
             */
            inflate(): StringIndexableObject & any;
            /**
             * Mutates the object.
             * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
             *
             * @param changes An object with the attributes and values to change
             * @returns The mutated object
             */
            mutate(changes: Partial<{
                [k: string]: BaseType | StringIndexableObject;
            }>): {
                [k: string]: BaseType | StringIndexableObject;
            };
            extract(props: (string | number)[]): {
                [k: string]: BaseType | StringIndexableObject;
            } & any;
        };
    };
    /**
     * Mutates the object.
     * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
     *
     * @param changes An object with the attributes and values to change
     * @returns The mutated object
     */
    mutate(changes: Partial<T>): T;
    /**
     * Extract some properties of the object.
     * @param props
     * @returns a new object containing only the extracted properties and values.
     */
    extract(props: (keyof T)[]): {
        [k: string]: T[keyof T];
    } & {
        /**
         * Find the differences to the given object.
         *
         * @param other object
         * @param include defines which values the result should include
         * @returns a new object containing only the properties which are modified with the original and the modified values.
         */
        diff(other: Partial<{
            [k: string]: T[keyof T];
        }>, include?: "from" | "to" | "both"): StringIndexableObject;
        /**
         * Checks if the current object contains another one.
         *
         * @param other object to compare with
         * @returns true if the current object contains the other one.
         */
        contains(other: Partial<{
            [k: string]: T[keyof T];
        }>): boolean;
        /**
         * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
         *
         * @returns List of paths with values in the given object
         */
        arrayize(): Arrayized[];
        /**
         * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
         *
         * @returns flat object of only one level, but with property names containing paths of the original object
         */
        flatten(): StringIndexableObject & {
            /**
             * Find the differences to the given object.
             *
             * @param other object
             * @param include defines which values the result should include
             * @returns a new object containing only the properties which are modified with the original and the modified values.
             */
            diff(other: Partial<StringIndexableObject>, include?: "from" | "to" | "both"): StringIndexableObject;
            /**
             * Checks if the current object contains another one.
             *
             * @param other object to compare with
             * @returns true if the current object contains the other one.
             */
            contains(other: Partial<StringIndexableObject>): boolean;
            /**
             * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
             *
             * @returns List of paths with values in the given object
             */
            arrayize(): Arrayized[];
            flatten(): StringIndexableObject & any;
            /**
             * Inflate a flattened object (with paths as property names) to a deeply nested object
             *
             * @returns Re-inflated object, which may contain a nesting structure.
             */
            inflate(): StringIndexableObject & any;
            /**
             * Mutates the object.
             * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
             *
             * @param changes An object with the attributes and values to change
             * @returns The mutated object
             */
            mutate(changes: Partial<StringIndexableObject>): StringIndexableObject;
            /**
             * Extract some properties of the object.
             * @param props
             * @returns a new object containing only the extracted properties and values.
             */
            extract(props: (string | number)[]): {
                [k: string]: BaseType | StringIndexableObject;
            } & {
                /**
                 * Find the differences to the given object.
                 *
                 * @param other object
                 * @param include defines which values the result should include
                 * @returns a new object containing only the properties which are modified with the original and the modified values.
                 */
                diff(other: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>, include?: "from" | "to" | "both"): StringIndexableObject;
                /**
                 * Checks if the current object contains another one.
                 *
                 * @param other object to compare with
                 * @returns true if the current object contains the other one.
                 */
                contains(other: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>): boolean;
                /**
                 * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
                 *
                 * @returns List of paths with values in the given object
                 */
                arrayize(): Arrayized[];
                /**
                 * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
                 *
                 * @returns flat object of only one level, but with property names containing paths of the original object
                 */
                flatten(): StringIndexableObject & any;
                /**
                 * Inflate a flattened object (with paths as property names) to a deeply nested object
                 *
                 * @returns Re-inflated object, which may contain a nesting structure.
                 */
                inflate(): StringIndexableObject & any;
                /**
                 * Mutates the object.
                 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
                 *
                 * @param changes An object with the attributes and values to change
                 * @returns The mutated object
                 */
                mutate(changes: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>): {
                    [k: string]: BaseType | StringIndexableObject;
                };
                extract(props: (string | number)[]): {
                    [k: string]: BaseType | StringIndexableObject;
                } & any;
            };
        };
        /**
         * Inflate a flattened object (with paths as property names) to a deeply nested object
         *
         * @returns Re-inflated object, which may contain a nesting structure.
         */
        inflate(): StringIndexableObject & {
            /**
             * Find the differences to the given object.
             *
             * @param other object
             * @param include defines which values the result should include
             * @returns a new object containing only the properties which are modified with the original and the modified values.
             */
            diff(other: Partial<StringIndexableObject>, include?: "from" | "to" | "both"): StringIndexableObject;
            /**
             * Checks if the current object contains another one.
             *
             * @param other object to compare with
             * @returns true if the current object contains the other one.
             */
            contains(other: Partial<StringIndexableObject>): boolean;
            /**
             * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
             *
             * @returns List of paths with values in the given object
             */
            arrayize(): Arrayized[];
            /**
             * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
             *
             * @returns flat object of only one level, but with property names containing paths of the original object
             */
            flatten(): StringIndexableObject & any;
            inflate(): StringIndexableObject & any;
            /**
             * Mutates the object.
             * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
             *
             * @param changes An object with the attributes and values to change
             * @returns The mutated object
             */
            mutate(changes: Partial<StringIndexableObject>): StringIndexableObject;
            /**
             * Extract some properties of the object.
             * @param props
             * @returns a new object containing only the extracted properties and values.
             */
            extract(props: (string | number)[]): {
                [k: string]: BaseType | StringIndexableObject;
            } & {
                /**
                 * Find the differences to the given object.
                 *
                 * @param other object
                 * @param include defines which values the result should include
                 * @returns a new object containing only the properties which are modified with the original and the modified values.
                 */
                diff(other: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>, include?: "from" | "to" | "both"): StringIndexableObject;
                /**
                 * Checks if the current object contains another one.
                 *
                 * @param other object to compare with
                 * @returns true if the current object contains the other one.
                 */
                contains(other: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>): boolean;
                /**
                 * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
                 *
                 * @returns List of paths with values in the given object
                 */
                arrayize(): Arrayized[];
                /**
                 * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
                 *
                 * @returns flat object of only one level, but with property names containing paths of the original object
                 */
                flatten(): StringIndexableObject & any;
                /**
                 * Inflate a flattened object (with paths as property names) to a deeply nested object
                 *
                 * @returns Re-inflated object, which may contain a nesting structure.
                 */
                inflate(): StringIndexableObject & any;
                /**
                 * Mutates the object.
                 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
                 *
                 * @param changes An object with the attributes and values to change
                 * @returns The mutated object
                 */
                mutate(changes: Partial<{
                    [k: string]: BaseType | StringIndexableObject;
                }>): {
                    [k: string]: BaseType | StringIndexableObject;
                };
                extract(props: (string | number)[]): {
                    [k: string]: BaseType | StringIndexableObject;
                } & any;
            };
        };
        /**
         * Mutates the object.
         * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
         *
         * @param changes An object with the attributes and values to change
         * @returns The mutated object
         */
        mutate(changes: Partial<{
            [k: string]: T[keyof T];
        }>): {
            [k: string]: T[keyof T];
        };
        extract(props: (string | number)[]): {
            [k: string]: T[keyof T];
        } & any;
    };
};

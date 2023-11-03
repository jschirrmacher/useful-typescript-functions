"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObject = exports.mutate = exports.getMutation = exports.renameAttribute = exports.objectContaining = exports.objectContains = exports.diff = exports.inflate = exports.flatten = exports.arrayize = void 0;
function union(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}
/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be destructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
function arrayize(obj) {
    const concat = (...parts) => parts.filter(x => x).join(".");
    if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
        return Object.entries(obj).flatMap(([key, value]) => {
            if (value === null) {
                return [[key, value]];
            }
            return arrayize(value).map(e => [concat(key, e[0]), e[1]]);
        });
    }
    return [["", obj]];
}
exports.arrayize = arrayize;
/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting levels.
 *
 * @param obj original, deeply nested object
 * @returns flat object of only one level, but with property names containing paths of the original object
 */
function flatten(obj) {
    return Object.fromEntries(arrayize(obj));
}
exports.flatten = flatten;
/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
function inflate(obj) {
    return Object.entries(obj).reduce((obj, [path, value]) => {
        const splitted = path.split(".");
        const last = splitted.pop();
        let pointer = obj;
        splitted.forEach(p => {
            if (!pointer[p]) {
                pointer[p] = {};
            }
            pointer = pointer[p];
        });
        pointer[last] = value;
        return obj;
    }, {});
}
exports.inflate = inflate;
/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param other modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
function diff(from, other, include = "both") {
    const values1 = flatten(from);
    const values2 = flatten(other);
    const valueMapping = {
        from: (p) => [p, values1[p]],
        to: (p) => [p, values2[p]],
        both: (p) => [p, { from: values1[p], to: values2[p] }],
    };
    const changes = union(Object.keys(values1), Object.keys(values2))
        .filter(p => values1[p] !== values2[p])
        .map(p => valueMapping[include](p));
    return inflate(Object.fromEntries(changes));
}
exports.diff = diff;
/**
 * Checks if an object contains another one.
 *
 * @param object object to compare
 * @param other object which might be contained in first object
 * @returns true if the current object contains the other one.
 */
function objectContains(object, other) {
    const flat1 = flatten(object);
    return arrayize(other).every(([key, value]) => flat1[key] === value);
}
exports.objectContains = objectContains;
function objectContaining(contains) {
    return {
        asymmetricMatch(obj) {
            return objectContains(obj, contains);
        },
    };
}
exports.objectContaining = objectContaining;
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
function renameAttribute(from, to) {
    return (obj) => {
        const { [from]: value, ...others } = obj;
        return { ...others, [to]: value };
    };
}
exports.renameAttribute = renameAttribute;
/**
 * Returns an object containing allowed changes to an original object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns Object containing allowed changes to an original object
 */
function getMutation(obj, attributes, changes) {
    const actualChanges = attributes
        .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
        .map(attribute => ({ [attribute]: changes[attribute] }));
    return Object.assign({}, ...actualChanges);
}
exports.getMutation = getMutation;
/**
 * Mutates an object.
 * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns The mutated object
 */
function mutate(obj, attributes, changes) {
    return { ...obj, ...getMutation(obj, attributes, changes) };
}
exports.mutate = mutate;
function createObject(obj, writableAttributes = Object.getOwnPropertyNames(obj)) {
    const data = obj || {};
    const base = {
        /**
         * Find the differences to the given object.
         *
         * @param other object
         * @param include defines which values the result should include
         * @returns a new object containing only the properties which are modified with the original and the modified values.
         */
        diff(other, include = "both") {
            return diff(data, other, include);
        },
        /**
         * Checks if the current object contains another one.
         *
         * @param other object to compare with
         * @returns true if the current object contains the other one.
         */
        contains(other) {
            return objectContains(data, other);
        },
        /**
         * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of the properties in the given object.
         *
         * @returns List of paths with values in the given object
         */
        arrayize() {
            return arrayize(data);
        },
        /**
         * Flatten the current object to have new properties containing paths with "." as separator for nesting levels.
         *
         * @returns flat object of only one level, but with property names containing paths of the original object
         */
        flatten() {
            return createObject(flatten(data));
        },
        /**
         * Inflate a flattened object (with paths as property names) to a deeply nested object
         *
         * @returns Re-inflated object, which may contain a nesting structure.
         */
        inflate() {
            return createObject(inflate(data));
        },
        /**
         * Mutates the object.
         * It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.
         *
         * @param changes An object with the attributes and values to change
         * @returns The mutated object
         */
        mutate(changes) {
            const mutated = mutate(data, writableAttributes, changes);
            return createObject(mutated, writableAttributes);
        },
    };
    return Object.setPrototypeOf(data, base);
}
exports.createObject = createObject;
//# sourceMappingURL=Objects.js.map
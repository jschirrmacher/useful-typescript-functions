/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given object.
 *
 * @param obj An object to be desctructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export function arrayize(obj) {
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
/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting levels.
 *
 * @param obj original, deeply nested object
 * @returns flat object of only one level, but with property names containing paths of the original object
 */
export function flatten(obj) {
    return Object.fromEntries(arrayize(obj));
}
/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export function inflate(obj) {
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
/**
 * @deprecated use `flatten()` instead
 */
export const flattenObject = flatten;
/**
 * @deprecated use `inflate()` instead
 */
export const inflateObject = inflate;
//# sourceMappingURL=flattenInflate.js.map
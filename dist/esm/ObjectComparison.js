import { arrayize, flatten } from "./flattenInflate.js";
export function objectContains(obj1, contains) {
    const flat1 = flatten(obj1);
    return arrayize(contains).every(([key, value]) => flat1[key] === value);
}
export function objectContaining(contains) {
    return {
        asymmetricMatch(obj) {
            return objectContains(obj, contains);
        },
    };
}
//# sourceMappingURL=ObjectComparison.js.map
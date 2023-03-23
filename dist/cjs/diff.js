"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = void 0;
const flattenInflate_1 = require("./flattenInflate");
function union(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}
/**
 * Find the differences between two objects.
 *
 * @param from original object
 * @param to modified object
 * @param include defines which values the result should include
 * @returns a new object containing only the properties which are modified with the original and the modified values.
 */
function diff(from, to, include = "both") {
    const values1 = (0, flattenInflate_1.flatten)(from);
    const values2 = (0, flattenInflate_1.flatten)(to);
    const valueMapping = {
        from: (p) => [p, values1[p]],
        to: (p) => [p, values2[p]],
        both: (p) => [p, { from: values1[p], to: values2[p] }],
    };
    const changes = union(Object.keys(values1), Object.keys(values2))
        .filter((p) => values1[p] !== values2[p])
        .map((p) => valueMapping[include](p));
    return (0, flattenInflate_1.inflate)(Object.fromEntries(changes));
}
exports.diff = diff;
//# sourceMappingURL=diff.js.map
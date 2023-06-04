"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectContaining = exports.objectContains = void 0;
const flattenInflate_js_1 = require("./flattenInflate.js");
function objectContains(obj1, contains) {
    const flat1 = (0, flattenInflate_js_1.flatten)(obj1);
    return (0, flattenInflate_js_1.arrayize)(contains).every(([key, value]) => flat1[key] === value);
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
//# sourceMappingURL=ObjectComparison.js.map
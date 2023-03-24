"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameAttribute = void 0;
/**
 * Rename an attribute in an object. This higher level function returns a mapper which can be used
 * in an `Array.map()` call. Example:
 *
 *    const mappedUsers = users.map(renameAttribute("name", "firstName"))
 *
 * @param from previous name of attribute
 * @param to new name of attribute
 * @returns (obj: Record<string, any>) => T
 */
function renameAttribute(from, to) {
    return (obj) => {
        const { [from]: value, ...others } = obj;
        return { ...others, [to]: value };
    };
}
exports.renameAttribute = renameAttribute;
//# sourceMappingURL=renameAttribute.js.map
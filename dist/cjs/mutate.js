"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutate = exports.getMutation = void 0;
function getMutation(obj, attributes, changes) {
    const actualChanges = attributes
        .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
        .map(attribute => ({ [attribute]: changes[attribute] }));
    return Object.assign({}, ...actualChanges);
}
exports.getMutation = getMutation;
function mutate(obj, attributes, changes) {
    return { ...obj, ...getMutation(obj, attributes, changes) };
}
exports.mutate = mutate;
//# sourceMappingURL=mutate.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutate = void 0;
function mutate(obj, attributes, changes) {
    const allowedChanges = attributes
        .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
        .map(attribute => ({ [attribute]: changes[attribute] }));
    return Object.assign({}, obj, ...allowedChanges);
}
exports.mutate = mutate;
//# sourceMappingURL=mutate.js.map
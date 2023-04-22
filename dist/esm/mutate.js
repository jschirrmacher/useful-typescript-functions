export function mutate(obj, attributes, changes) {
    const allowedChanges = attributes
        .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
        .map(attribute => ({ [attribute]: changes[attribute] }));
    return Object.assign({}, obj, ...allowedChanges);
}
//# sourceMappingURL=mutate.js.map
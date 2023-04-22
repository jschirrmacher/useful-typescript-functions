export function getMutation(obj, attributes, changes) {
    const actualChanges = attributes
        .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
        .map(attribute => ({ [attribute]: changes[attribute] }));
    return Object.assign({}, ...actualChanges);
}
export function mutate(obj, attributes, changes) {
    return { ...obj, ...getMutation(obj, attributes, changes) };
}
//# sourceMappingURL=mutate.js.map
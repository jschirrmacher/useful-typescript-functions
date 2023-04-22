export function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
  const allowedChanges = attributes
    .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
    .map(attribute => ({ [attribute]: changes[attribute] }))
  return Object.assign({}, obj, ...allowedChanges)
}

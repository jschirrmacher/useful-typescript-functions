export function getMutation<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
  const actualChanges = attributes
    .filter(attribute => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
    .map(attribute => ({ [attribute]: changes[attribute] }))
  return Object.assign({}, ...actualChanges)
}

export function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
  return { ...obj, ...getMutation(obj, attributes, changes) }
}

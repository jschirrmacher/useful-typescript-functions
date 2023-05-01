/* eslint-disable @typescript-eslint/no-explicit-any */
type Func = (previousResult?: any) => unknown

export async function oneByOne<T>(funcs: Array<Func>, start?: unknown) {
  return funcs.reduce(
    async (promise, func) => func(await promise),
    Promise.resolve(start)
  ) as Promise<T>
}

type Func = (previousResult?: any) => unknown;
export declare function oneByOne<T>(funcs: Array<Func>, start?: unknown): Promise<T>;
export {};

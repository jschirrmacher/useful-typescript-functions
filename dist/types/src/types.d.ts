export type PathValue = Record<string, unknown>;
export type NestedValue<T extends string> = T extends `${infer K}.${infer Rest}` ? K extends `${number}` ? NestedArray<Rest> : {
    [key in K]: NestedValue<Rest>;
} : T extends `${number}` ? unknown[] : unknown;
export type NestedArray<T extends string> = T extends `${infer K}.${infer Rest}` ? K extends `${number}` ? NestedArray<Rest>[] : {
    [key in K]: NestedValue<Rest>;
}[] : unknown[];
export type Arrayized = [string, unknown];

export declare type BaseType = string | number | boolean | null | undefined | Date;
export interface StringIndexableObject {
    [property: string]: BaseType | StringIndexableObject;
}
export declare type Arrayized = [string, BaseType];
export declare type FlatObject = Record<string, BaseType>;

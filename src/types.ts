export type BaseType = string | number | boolean | null | undefined | Date
export interface StringIndexableObject {
  [property: string]: BaseType | StringIndexableObject
}
export type Arrayized = [string, BaseType]
export type FlatObject = Record<string, BaseType>

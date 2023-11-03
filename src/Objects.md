# Objects

A lot of functions from this module can be either directly imported from `useful-typescript-functions` or can be used in object notation on an object created with `createObject`:

```ts
import { createObject } from "useful-typescript-functions"

const obj = createObject({ prop1: 1, prop2: "abc })
const result = obj.diff({ prop1: 2, prop2: "def" }).arrayize()
// {
//  prop1: { from: 1, to: 2 },
//  prop2: { from: "abc", to: "def" }
// }
```

## `diff()`

Allows to compare objects.

It returns an object containing only the differing properties, even in deeper nested structures.
It can be configured to include the values from either object or even both.

```ts
import { diff } from "useful-typescript-functions"

const result = diff(
  {
    prop: 1,
    date: new Date("2022-10-15T07:43:00"),
  },
  {
    prop: 2,
    date: new Date(),
  },
)
```

Returns (at least as of writing this example here in UTC+2):

```ts
{
  prop: { from: 1, to: 2 },
  date: { from: 2022-10-15T05:43:00.000Z, to: 2022-10-15T05:48:03.502Z }
}
```

To include only the previous values, add a third parameter to `diff`:

```ts
const from = diff({ prop: 1 }, { prop: 2 }, "from")
// -> { prop: 1 }
const to = diff({ prop: 1 } { prop: 2 }, "to")
// -> { prop: 2 }
```

If there are no differences between the two objects, the returned value is an empty object.

See some more examples in the [tests](./Objects.test.ts), and have a [look at the code](./Objects.ts) for the comment blocks of `diff()`.

## `flatten()`

This function flattens an deeply nested object to one level. The 'paths' of the original nesting level are conserved as new property names like in the following example:

```ts
import { flatten } from "useful-typescript-functions"

const flatted = flatten({
  shallow: 1,
  deep: {
    deeper: {
      property: "abc",
    },
  },
})
// ->  { shallow: 1, 'deep.deeper.property': 'abc' }
```

## `inflate()`

This function is the opposite of `flatten()`. It takes an object in the form of the result of `flatten()` and creates a new object, containing all necessary nesting levels:

```ts
import { inflate } from "useful-typescript-functions"

const inflated = inflate({ shallow: 1, "deep.deeper.property": "abc" })
// -> { shallow: 1, deep: { deeper: { property: 'abc' }}}
```

## `objectContains()`

Deep compare two object a and b in a way that all properties with values from b must be also in a. Other properties/values of a are ignored.

```ts
import { objectContains } from "useful-typescript-functions"

console.log(objectContains({ a: 1, b: "c" }, { b: "d" }))
// -> false
console.log(objectContains({ a: 1, b: "c" }, { a: 1 }))
// -> true
```

## `objectContaining()`

Returns an asymmetricMatcher object which helps comparing the given object with other objects.

```ts
import { objectContaining } from "useful-typescript-functions"

const matcher = objectContaining({ b: "c" })
console.log(matcher({ a: 1, b: "c" }))
// -> true
```

## `renameAttribute()`

Rename an attribute in an object. This higher level function returns a mapper which can be used in an `Array.map()` call:

```ts
import { renameAttribute } from "useful-typescript-functions"

const users = [{ name: "john" }, { name: "arnold" }]
const mappedUsers = users.map(renameAttribute("name", "firstName"))
// -> [{ firstName: "john" }, { firstName: "arnold" }]
```

## `getMutation`

Returns an object containing allowed changes to an original object.
It ignores both, attributes not contained in the original object, and attributes not allowed to be changed.

```ts
import { getMutation } from "useful-typescript-functions"

const original = { mutable: 1, immutable: 2 }
const change = { mutable: 3, immutable: 4, other: 5 }

const mutation = getMutation(original, ["mutable"], change)
// -> { mutable: 3 }
```

## `mutate`

Changes an object regarding only some attributes from another object:

```ts
import { mutate } from "useful-typescript-functions"

const original = { mutable: 1, immutable: 2 }
const change = { mutable: 3, immutable: 4, other: 5 }

const mutated = mutate(original, ["mutable"], change)
// -> { mutable: 3, immutable: 2 }
```

Mutable attributes cannot be mutated to undefined, but it is possible to set them to null.
This enables usage for updating database entities.

## `createObject`

This function allows to create an object implementing a lot of the above functions on itself, which makes it possible to omit parameters and thus make the interface more readable. See the following example code how it can be used:

```ts
import { createObject } from "useful-typescript-functions"

const obj = createObject({ level: 42, deep: { area: 52 } }, ["level"])
// -------------------------------------------------------------^ only this attribute is writable

console.log(
  JSON.stringify(
    {
      arrayized: obj.arrayize(),
      contains: obj.contains({ level: 42 }),
      diffed: obj.diff({ level: 52 }),
      flattened: obj.flatten(),
      inflated: flattened.inflate(),
      mutated: obj.mutate({ level: 52, deep: { area: 42 } }),
    },
    null,
    2,
  ),
)

// {
//   arrayized: [
//     ["level", 42],
//     ["deep.area", 52],
//   ],
//   contains: true,
//   diffed: {
//     level: { from: 42, to: 52 },
//     deep: {
//       area: { from: 52 },
//     },
//   },
//   flattened: {
//     level: 42,
//     "deep.area": 52,
//   },
//   inflated: {
//     level: 42,
//     deep: { area: 52 },
//   },
//   mutated: {
//     level: 52,
//     deep: { area: 52 },
//   },
// }
```

# Object utilities

A useful collection of object related functions.

- [**diff** two complex objects](#diff)
- [**flatten** a complex object to a list of attributes with their values](#flatten)
- [**inflate** a complex object from a list of attributes](#inflate)
- [**renameAttribute** in a flat object](#renameAttribute)
- [**mutate** only allowed fields of a flat object](#mutate)

## What is the difference between a flat and a complex object?

Complex objects are those which can contain other objects in one or more attributes.
Flat objects are those which only contain scalar attributes.

## `diff()`

Allows to compare objects for changes. Written in Typescript and works for CJS and ESM.

It returns an object containing only the differing properties, even in deeper nested structures.
It can be configured to include the values from either object or even both.

```ts
import { diff } from "js-object-utils"

const result = diff({
  prop: 1,
  date: new Date("2022-10-15T07:43:00")
}, {
  prop: 2,
  date: new Date()
})
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
//{ prop: 2 }
```

If there are no differences between the two objects, the returned value is an empty object.

See some more examples in the [tests](./src/diff.test.ts), and have a [look at the code](./src/diff.ts) for the comment blocks of `diff()`. 

## `flatten()`

This function flattens an deeply nested object to one level. The 'paths' of the original nesting level are conserved as new property names like in the following example:

```ts
import { flatten } from "js-object-utils"

const flatted = flatten({
  shallow: 1,
  deep: {
    deeper: {
      property: "abc"
    }
  }
})
// ->  { shallow: 1, 'deep.deeper.property': 'abc' }
```

## `inflate()`

This function is the opposite of `flatten()`. It takes an object in the form of the result of `flatten()` and creates a new object, containing all necessary nesting levels:

```ts
import { inflate } from "js-object-utils"

const inflated = inflate({ shallow: 1, 'deep.deeper.property': 'abc' })
// -> { shallow: 1, deep: { deeper: { property: 'abc' }}}
```

## `renameAttribute()`

Rename an attribute in an object. This higher level function returns a mapper which can be used in an `Array.map()` call:

```ts
import { renameAttribute } from "js-object-utils"

const users = [
  { name: "john" },
  { name: "arnold" },
]
const mappedUsers = users.map(renameAttribute("name", "firstName"))
// -> [{ firstName: "john" }, { firstName: "arnold" }]
```

## `mutate`

Changes an object regarding only some attributes from another object:

```ts
import { mutate } from "js-object-utils"

const original = { mutable: 1, immutable: 2 }
const change = { mutable: 3, immutable: 4, other: 5 }

const mutated = mutate(original, ["mutable"], change)
// -> { mutable: 3, immutable: 2 }
```

Mutable attributes cannot be mutated to undefined, but it is possible to set them to null.
This enables usage for updating database entities.

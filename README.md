# Object utilities

A useful collection of object related functions.

## `diff()`

Allows to compare objects for changes. Written in Typescript and works for CJS and ESM.

It returns an object containing only the differing properties, even in deeper nested structures.
It can be configured to include the values from either object or even both.

    import { diff } from "js-object-utils"

    console.log(diff({
        prop: 1,
        date: new Date("2022-10-15T07:43:00")
    }, {
        prop: 2,
        date: new Date()
    }))

Returns (at least as of writing this example here in UTC+2):

    {
        prop: { from: 1, to: 2 },
        date: { from: 2022-10-15T05:43:00.000Z, to: 2022-10-15T05:48:03.502Z }
    }

To include only the previous values, add a third parameter to `diff`:

    diff({ prop: 1 }, { prop: 2 }, "from")

this will result in:

    { prop: 1 }

When using "to" instead of "from" the result will be:

    { prop: 2 }

If there are no differences between the two objects, the returned value is an empty object.

See some more examples in the [tests](./src/diff.test.ts), and have a [look at the code](./src/diff.ts) for the comment blocks of `diff()`. 

## `flatten()`

This function flattens an deeply nested object to one level. The 'paths' of the original nesting level are conserved as new property names like in the following example:

    import { flatten } from "js-object-utils"

    console.log(
        flatten({
            shallow: 1,
            deep: {
                deeper: {
                    property: "abc"
                }
            }
        })
    )

Results in

    { shallow: 1, 'deep.deeper.property': 'abc' }

## `inflate()`

This function is the opposite of `flatten()`. It takes an object in the form of the result of `flatten()` and creates a new object, containing all necessary nesting levels:

    import { inflate } from "js-object-utils"

    console.log(
        inflate({ shallow: 1, 'deep.deeper.property': 'abc' })
    )

Results in

    { shallow: 1, deep: { deeper: { property: 'abc' } } }

## `renameAttribute()`

Rename an attribute in an object. This higher level function returns a mapper which can be used in an `Array.map()` call:

    import { renameAttribute } from "js-object-utils"

    const mappedUsers = users.map(renameAttribute("name", "firstName"))

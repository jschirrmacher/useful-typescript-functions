# Object utilities

## `diff()`

Allows to compare objects for changes. Written in Typescript and works for CJS and ESM.

It returns an object containing only the differing properties, even in deeper nested structures.
It can be configured to include the values from either object or even both.

    import { diff } from "@jschirrmacher/object-utils"

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

See some more examples in the [tests](./src/objectUtils.test.ts), and have a [look at the code](./src/index.ts) for the comment blocks of `diff()`. 

## `flattenObject()`

This function flattens an deeply nested object to one level. The 'paths' of the original nesting level are conserved as new property names like in the following example:

    import { flattenObject } from "@jschirrmacher/object-utils"

    console.log(
        flattenObject({
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

## `inflateObject()`

This function is the opposite of `flattenObject()`. It takes an object in the form of the result of `flattenObject()` and creates a new object, containing all necessary nesting levels:

    import { inflateObject } from "@jschirrmacher/object-utils"

    console.log(
        inflateObject({ shallow: 1, 'deep.deeper.property': 'abc' })
    )

Results in

    { shallow: 1, deep: { deeper: { property: 'abc' } } }

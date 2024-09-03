"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Objects_1 = require("./Objects");
(0, vitest_1.describe)("Objects", () => {
    (0, vitest_1.describe)("diff", () => {
        (0, vitest_1.it)("should return no differences if objects are identical", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: 1 }, { a: 1 })).toEqual({});
        });
        (0, vitest_1.it)("should list scalar attributes with the previous value", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: 1 }, { a: 2 })).toEqual({ a: { from: 1, to: 2 } });
        });
        (0, vitest_1.it)("should recurse into sub objects", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ deep: { a: 1 } }, { deep: { a: 2 } })).toEqual({
                deep: { a: { from: 1, to: 2 } },
            });
        });
        (0, vitest_1.it)("should ignore unchanged properties", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ deep: { a: 1, b: 3 } }, { deep: { a: 2, b: 3 } })).toEqual({
                deep: { a: { from: 1, to: 2 } },
            });
        });
        (0, vitest_1.it)("should handle new sub objects", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: { b: 1 } }, { a: { b: 1 }, b: { a: 2 } })).toEqual({
                b: { a: { from: undefined, to: 2 } },
            });
        });
        (0, vitest_1.it)("should handle disappearing sub objects", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: { b: 1 }, b: { a: 2 } }, { a: { b: 1 } })).toEqual({
                b: { a: { from: 2, to: undefined } },
            });
        });
        (0, vitest_1.it)("should compare Dates", () => {
            const date = new Date();
            const newDate = new Date(+date + 3600_000);
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: date }, { a: newDate })).toEqual({ a: { from: date, to: newDate } });
        });
        (0, vitest_1.it)("works with 'from' param", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "from")).toEqual({ b: 2, d: 4, e: undefined });
        });
        (0, vitest_1.it)("works with 'to' param", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: 1, b: 2, c: undefined, d: 4 }, { a: 1, b: 3, d: undefined, e: 5 }, "to")).toEqual({ b: 3, d: undefined, e: 5 });
        });
        (0, vitest_1.it)("works with type changes", () => {
            (0, vitest_1.expect)((0, Objects_1.diff)({ a: [3, 2, 1] }, { a: [{ b: 2 }, { c: 4 }] }, "both")).toEqual({
                a: [
                    { b: { from: undefined, to: 2 }, from: 3, to: undefined },
                    { c: { from: undefined, to: 4 }, from: 2, to: undefined },
                    { from: 1, to: undefined },
                ],
            });
        });
    });
    (0, vitest_1.describe)("flattenInflate", () => {
        (0, vitest_1.describe)("arrayize", () => {
            (0, vitest_1.it)("should return a list of property values", () => {
                (0, vitest_1.expect)((0, Objects_1.arrayize)(null)).toEqual([["", null]]);
                (0, vitest_1.expect)((0, Objects_1.arrayize)(1)).toEqual([["", 1]]);
                const date = new Date();
                (0, vitest_1.expect)((0, Objects_1.arrayize)(date)).toEqual([["", date]]);
                (0, vitest_1.expect)((0, Objects_1.arrayize)({ a: 1 })).toEqual([["a", 1]]);
                (0, vitest_1.expect)((0, Objects_1.arrayize)({ a: 1, b: { c: 2 } })).toEqual([
                    ["a", 1],
                    ["b.c", 2],
                ]);
                (0, vitest_1.expect)((0, Objects_1.arrayize)({ a: { b: 1 }, b: { a: 2 } })).toEqual([
                    ["a.b", 1],
                    ["b.a", 2],
                ]);
            });
            (0, vitest_1.it)("should recognize Dates", () => {
                const date = new Date();
                (0, vitest_1.expect)((0, Objects_1.arrayize)({ a: date })).toEqual([["a", date]]);
            });
            (0, vitest_1.it)("should arrayize arrays", () => {
                (0, vitest_1.expect)((0, Objects_1.arrayize)([3, 2, 1])).toEqual([
                    ["0", 3],
                    ["1", 2],
                    ["2", 1],
                ]);
            });
        });
        (0, vitest_1.describe)("flatten", () => {
            (0, vitest_1.it)("should return a flat object with all values", () => {
                const date = new Date();
                (0, vitest_1.expect)((0, Objects_1.flatten)(null)).toEqual({ "": null });
                (0, vitest_1.expect)((0, Objects_1.flatten)(42)).toEqual({ "": 42 });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: undefined })).toEqual({ a: undefined });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: 1 })).toEqual({ a: 1 });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: date })).toEqual({ a: date });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: 1, b: { c: 2 } })).toEqual({ a: 1, "b.c": 2 });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: { b: 1 }, b: { a: 2 } })).toEqual({ "a.b": 1, "b.a": 2 });
                (0, vitest_1.expect)((0, Objects_1.flatten)([3, 2, 1])).toEqual({ "0": 3, "1": 2, "2": 1 });
                (0, vitest_1.expect)((0, Objects_1.flatten)({ a: [3, 2, { b: 1 }] })).toEqual({ "a.0": 3, "a.1": 2, "a.2.b": 1 });
            });
        });
        (0, vitest_1.describe)("inflate", () => {
            (0, vitest_1.it)("should inflate flattened data correctly", () => {
                const data = { a: { b: [3, 2, 1], c: true, d: new Date() } };
                (0, vitest_1.expect)((0, Objects_1.inflate)((0, Objects_1.flatten)(data))).toEqual(data);
            });
        });
    });
    (0, vitest_1.describe)("objectContains()", () => {
        (0, vitest_1.it)("should check only the parts specified in the second object", () => {
            (0, vitest_1.expect)((0, Objects_1.objectContains)({ a: 1, b: "c" }, { b: "c" })).toBe(true);
        });
        (0, vitest_1.it)("should return false if something is different in first object", () => {
            (0, vitest_1.expect)((0, Objects_1.objectContains)({ a: 1, b: "c" }, { b: "d" })).toBe(false);
        });
        (0, vitest_1.it)("should return false if something is missing in first object", () => {
            (0, vitest_1.expect)((0, Objects_1.objectContains)({ a: 1 }, { b: "c" })).toBe(false);
        });
    });
    (0, vitest_1.describe)("objectContaining()", () => {
        (0, vitest_1.it)("should return an object containing an asymmetricMatch() function", () => {
            const matcher = (0, Objects_1.objectContaining)({ a: 1 });
            (0, vitest_1.expect)(matcher).toBeInstanceOf(Object);
            (0, vitest_1.expect)(matcher).toHaveProperty("asymmetricMatch");
            (0, vitest_1.expect)(matcher.asymmetricMatch({ a: 1 })).toBe(true);
            (0, vitest_1.expect)(matcher.asymmetricMatch({ b: 2 })).toBe(false);
        });
    });
    (0, vitest_1.describe)("renameAttribute", () => {
        (0, vitest_1.it)("should rename an attribute", () => {
            (0, vitest_1.expect)((0, Objects_1.renameAttribute)("a", "b")({ a: 42 })).toEqual({ b: 42 });
        });
        (0, vitest_1.it)("should keep other attributes", () => {
            (0, vitest_1.expect)((0, Objects_1.renameAttribute)("a", "b")({ a: 42, c: 815 })).toEqual({ b: 42, c: 815 });
        });
        (0, vitest_1.it)("should keep non-scalar values", () => {
            (0, vitest_1.expect)((0, Objects_1.renameAttribute)("a", "b")({ a: { c: "deep" } })).toEqual({ b: { c: "deep" } });
        });
    });
    const original = { mutable: "a", immutable: 1 };
    const writeableAttributes = ["mutable"];
    (0, vitest_1.describe)("getMutation", () => {
        (0, vitest_1.it)("return a list of changes", () => {
            const result = (0, Objects_1.getMutation)(original, writeableAttributes, {
                mutable: "b",
                immutable: 2,
                other: 42,
            });
            (0, vitest_1.expect)(result).toEqual({ mutable: "b" });
        });
    });
    (0, vitest_1.describe)("mutate", () => {
        (0, vitest_1.it)("should restrict changes to allowed attributes", () => {
            const result = (0, Objects_1.mutate)(original, writeableAttributes, {
                mutable: "b",
                immutable: 2,
            });
            (0, vitest_1.expect)(result).toStrictEqual({ mutable: "b", immutable: 1 });
        });
        (0, vitest_1.it)("should ignore unknown attributes", () => {
            const result = (0, Objects_1.mutate)(original, writeableAttributes, {
                other: 42,
            });
            (0, vitest_1.expect)(result).toStrictEqual({ mutable: "a", immutable: 1 });
        });
        (0, vitest_1.it)("should be possible to empty a mutable field", () => {
            const result = (0, Objects_1.mutate)(original, writeableAttributes, {
                mutable: null,
            });
            (0, vitest_1.expect)(result).toStrictEqual({ mutable: null, immutable: 1 });
        });
    });
    (0, vitest_1.describe)("extract", () => {
        (0, vitest_1.it)("should only contain the requested properties and values", () => {
            const original = { a: 42, b: "test", c: { d: 4711 } };
            (0, vitest_1.expect)((0, Objects_1.extract)(original, ["b", "c"])).toEqual({
                b: "test",
                c: { d: 4711 },
            });
        });
    });
    (0, vitest_1.describe)("createObject", () => {
        const original = { level: 42, deep: { area: 52 } };
        const created = (0, Objects_1.createObject)(original);
        (0, vitest_1.it)("should return an object containing the given attributes and values", () => {
            (0, vitest_1.expect)(created).toEqual(original);
        });
        (0, vitest_1.it)("arrayized() should return the attributes and values in list form", () => {
            (0, vitest_1.expect)(created.arrayize()).toEqual([
                ["level", 42],
                ["deep.area", 52],
            ]);
        });
        (0, vitest_1.it)("contains() should return the expected values", () => {
            (0, vitest_1.expect)(created.contains({ level: 42 })).toBe(true);
            (0, vitest_1.expect)(created.contains({ deep: { area: 52 } })).toBe(true);
            (0, vitest_1.expect)(created.contains({ other: 62 })).toBe(false);
        });
        (0, vitest_1.it)("diff() should return the differences", () => {
            (0, vitest_1.expect)(created.diff({ level: 32, deep: { area: 62 } })).toEqual({
                deep: { area: { from: 52, to: 62 } },
                level: { from: 42, to: 32 },
            });
        });
        (0, vitest_1.it)("flatten() should collect deep values to top level", () => {
            (0, vitest_1.expect)(created.flatten()).toEqual({
                level: 42,
                "deep.area": 52,
            });
        });
        (0, vitest_1.it)("inflate() should create deep values", () => {
            const flattened = created.flatten();
            (0, vitest_1.expect)(flattened.inflate().contains(original)).toBe(true);
        });
        (0, vitest_1.it)("mutate() should mutate attribute values", () => {
            (0, vitest_1.expect)(created.mutate({ level: 43 })).toEqual({ level: 43, deep: { area: 52 } });
        });
    });
});
//# sourceMappingURL=Objects.test.js.map
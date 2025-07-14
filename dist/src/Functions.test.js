"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Functions_js_1 = require("./Functions.js");
(0, vitest_1.describe)("Functions", () => {
    (0, vitest_1.describe)("oneByOne", () => {
        (0, vitest_1.it)("should call the function for each array element", async () => {
            const func = vitest_1.vi.fn();
            await (0, Functions_js_1.oneByOne)([func, func]);
            (0, vitest_1.expect)(func).toBeCalledTimes(2);
        });
        (0, vitest_1.it)("should resolve to the return value of the last function that is executed", async () => {
            (0, vitest_1.expect)(await (0, Functions_js_1.oneByOne)([() => Promise.resolve(1), () => Promise.resolve(2)])).toBe(2);
        });
        (0, vitest_1.it)("should give the result of each function as parameter to next in row", async () => {
            (0, vitest_1.expect)(await (0, Functions_js_1.oneByOne)([() => Promise.resolve(41), (val) => Promise.resolve(val + 1)])).toBe(42);
        });
        (0, vitest_1.it)("should return the value created by the chain of functions", async () => {
            let num = 1;
            const func2 = (prev) => (prev || []).concat(num++);
            (0, vitest_1.expect)(await (0, Functions_js_1.oneByOne)([func2, func2, func2, func2])).toEqual([1, 2, 3, 4]);
        });
        (0, vitest_1.it)("should work without defining functions explicitly as asynchronous", async () => {
            const readUsers = () => Promise.resolve([{ name: "user1" }, { name: "user2" }]);
            const readDetails = (users) => Promise.all(users.map(user => Promise.resolve({ ...user, details: `details of ${user.name}` })));
            (0, vitest_1.expect)(await (0, Functions_js_1.oneByOne)([readUsers, readDetails])).toEqual([
                { name: "user1", details: "details of user1" },
                { name: "user2", details: "details of user2" },
            ]);
        });
    });
});
//# sourceMappingURL=Functions.test.js.map
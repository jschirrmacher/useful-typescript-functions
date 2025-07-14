"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneByOne = oneByOne;
async function oneByOne(funcs, start) {
    return funcs.reduce(async (promise, func) => func(await promise), Promise.resolve(start));
}
//# sourceMappingURL=Functions.js.map
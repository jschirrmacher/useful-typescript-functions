"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneByOne = void 0;
async function oneByOne(funcs, start) {
    return funcs.reduce(async (promise, func) => func(await promise), Promise.resolve(start));
}
exports.oneByOne = oneByOne;
//# sourceMappingURL=onebyone.js.map
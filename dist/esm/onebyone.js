export async function oneByOne(funcs, start) {
    return funcs.reduce(async (promise, func) => func(await promise), Promise.resolve(start));
}
//# sourceMappingURL=onebyone.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const KeyedState_js_1 = require("./KeyedState.js");
const Logger_js_1 = require("../Logger.js");
require("../vitest.js");
const logger = (0, Logger_js_1.Logger)();
const entityManager = {
    delete: vitest_1.vi.fn(),
    insert: vitest_1.vi.fn(),
};
const searchResult = {
    getMany: vitest_1.vi.fn().mockResolvedValue([]),
};
const repository = {
    createQueryBuilder: vitest_1.vi.fn().mockReturnValue({
        where: vitest_1.vi.fn().mockReturnValue(searchResult),
    }),
    delete: vitest_1.vi.fn(),
    manager: {
        transaction: vitest_1.vi.fn(async (func) => await func(entityManager)),
    },
};
const dataSource = {
    getRepository: vitest_1.vi.fn().mockReturnValue(repository),
};
const singleState = { id: "4711", test: 42 };
const singleState2 = { id: "4712", test: 24 };
(0, vitest_1.describe)("KeyedState", () => {
    (0, vitest_1.beforeEach)(() => {
        logger.runInTest(vitest_1.expect);
    });
    (0, vitest_1.afterAll)(async () => {
        vitest_1.vi.restoreAllMocks();
        (0, vitest_1.expect)(logger).toLogAsExpected();
        await (0, KeyedState_js_1.saveAllCheckpoints)();
    });
    function keyFunc({ id }) {
        return id;
    }
    (0, vitest_1.it)("should return the last saved state identified by its key", async () => {
        logger.expect({ message: "Reading test-state from beginning" });
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState);
        await state.saveCheckpoint();
        (0, vitest_1.expect)(state.getByKey("4711")).toEqual({ id: "4711", test: 42 });
    });
    (0, vitest_1.it)("should allow to delete a keyed state", async () => {
        logger.expect({ message: "Reading test-state from beginning" });
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState);
        await state.saveCheckpoint();
        state.unset(singleState);
        await state.saveCheckpoint();
        (0, vitest_1.expect)(state.getByKey(singleState.id)).toBeUndefined();
    });
    (0, vitest_1.it)("should store the offset of a partition", async () => {
        logger.expect({ message: "Reading test-state from beginning" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets ,,,,42" });
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState, "42", 4);
        await state.saveCheckpoint();
        (0, vitest_1.expect)(state.getOffset(4)).toEqual("42");
    });
    (0, vitest_1.it)("should store offsets of different partition independently", async () => {
        logger.expect({ message: "Reading test-state from beginning" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets ,,24,,42" });
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState, "24", 2);
        state.set(singleState2, "42", 4);
        await state.saveCheckpoint();
        (0, vitest_1.expect)(state.getOffset(2)).toEqual("24");
        (0, vitest_1.expect)(state.getOffset(4)).toEqual("42");
    });
    (0, vitest_1.it)("should return the last checkpoint as the starting position if the state was created normally", async () => {
        logger.expect({ message: "Reading test from beginning" });
        logger.expect({ message: "Created state checkpoint for test with offsets 24" });
        logger.expect({ message: "Loaded checkpoint for test at offsets 24" });
        searchResult.getMany = vitest_1.vi.fn().mockResolvedValue([
            { key: "__offsets", state: JSON.stringify(["24"]) },
            { key: "42", state: JSON.stringify([singleState]) },
        ]);
        const state = await (0, KeyedState_js_1.createState)("test", dataSource, keyFunc, true, logger);
        state.set(singleState, "24");
        await state.saveCheckpoint();
        const newState = await (0, KeyedState_js_1.createState)("test", dataSource, keyFunc, false, logger);
        (0, vitest_1.expect)(newState.getOffset(0)).toEqual("24");
    });
    (0, vitest_1.it)("should return the start position if the state was created without a checkpoint", async () => {
        logger.expect({ message: "Reading test from beginning" });
        const state = await (0, KeyedState_js_1.createState)("test", dataSource, keyFunc, true, logger);
        (0, vitest_1.expect)(state.getStartPos()).toEqual("start");
    });
    (0, vitest_1.it)("should delete the last checkpoint if the state was createed without a checkpoint", async () => {
        logger.expect({ message: "Reading test from beginning" });
        logger.expect({ message: "Created state checkpoint for test with offsets 24" });
        logger.expect({ message: "Loaded checkpoint for test at offsets 24" });
        const state = await (0, KeyedState_js_1.createState)("test", dataSource, keyFunc, true, logger);
        state.set(singleState, "24");
        await state.saveCheckpoint();
        const newState = await (0, KeyedState_js_1.createState)("test", dataSource, keyFunc, false, logger);
        (0, vitest_1.expect)(newState.getStartPos()).toEqual("checkpoint");
    });
    (0, vitest_1.it)("should persist the current state at latest 60 seconds after setting it", async () => {
        vitest_1.vi.useFakeTimers();
        logger.expect({ message: "Reading test-state from beginning" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets 42" });
        entityManager.insert = vitest_1.vi.fn();
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState, "42");
        vitest_1.vi.advanceTimersByTime(60_000);
        vitest_1.vi.useRealTimers();
        await new Promise(setImmediate); // flush Promises queue
        (0, vitest_1.expect)(entityManager.insert).toBeCalledTimes(2);
    });
    async function flushPromises() {
        vitest_1.vi.useRealTimers();
        await new Promise(setImmediate); // flush Promises queue
        vitest_1.vi.useFakeTimers();
    }
    (0, vitest_1.it)("should persist the current state at latest 60 seconds after deleting it", async () => {
        vitest_1.vi.useFakeTimers();
        logger.expect({ message: "Reading test-state from beginning" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets 42" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets 43" });
        entityManager.insert = vitest_1.vi.fn();
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState, "42");
        vitest_1.vi.advanceTimersByTime(60_000);
        await flushPromises();
        state.unset(singleState, "43");
        vitest_1.vi.advanceTimersByTime(60_000);
        await flushPromises();
        (0, vitest_1.expect)(entityManager.insert).toBeCalledTimes(4);
    });
    (0, vitest_1.it)("should save all checkpoints immediately when requested to", async () => {
        logger.expect({ message: "Reading test-state from beginning" });
        logger.expect({ message: "Created state checkpoint for test-state with offsets 42,24" });
        entityManager.insert = vitest_1.vi.fn();
        const state = await (0, KeyedState_js_1.createState)("test-state", dataSource, keyFunc, true, logger);
        state.set(singleState, "42", 0);
        state.set(singleState2, "24", 1);
        await (0, KeyedState_js_1.saveAllCheckpoints)();
    });
});
//# sourceMappingURL=KeyedState.test.js.map
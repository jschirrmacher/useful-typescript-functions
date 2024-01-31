import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { createState, saveAllCheckpoints } from "./KeyedState.js"
import { Logger } from "../Logger.js"
import { DataSource } from "typeorm"
import "../vitest.js"

const logger = Logger()

const entityManager = {
  delete: vi.fn(),
  insert: vi.fn(),
}

const searchResult = {
  getMany: vi.fn().mockResolvedValue([]),
}

const repository = {
  createQueryBuilder: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue(searchResult),
  }),
  delete: vi.fn(),
  manager: {
    transaction: vi.fn(
      async (func: (em: unknown) => void | Promise<void>) => await func(entityManager),
    ),
  },
}

const dataSource = {
  getRepository: vi.fn().mockReturnValue(repository),
} as unknown as DataSource

type SingleState = {
  id: string
  test: number
}

const singleState = { id: "4711", test: 42 }
const singleState2 = { id: "4712", test: 24 }

describe("KeyedState", () => {
  beforeEach(() => {
    logger.runInTest(expect)
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    expect(logger).toLogAsExpected()
    await saveAllCheckpoints()
  })

  function keyFunc({ id }: SingleState) {
    return id
  }

  it("should return the last saved state identified by its key", async () => {
    logger.expect({ message: "Reading test-state from beginning" })
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState)
    await state.saveCheckpoint()
    expect(state.getByKey("4711")).toEqual({ id: "4711", test: 42 })
  })

  it("should allow to delete a keyed state", async () => {
    logger.expect({ message: "Reading test-state from beginning" })
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState)
    await state.saveCheckpoint()
    state.unset(singleState)
    await state.saveCheckpoint()
    expect(state.getByKey(singleState.id)).toBeUndefined()
  })

  it("should store the offset of a partition", async () => {
    logger.expect({ message: "Reading test-state from beginning" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets ,,,,42" })
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState, "42", 4)
    await state.saveCheckpoint()
    expect(state.getOffset(4)).toEqual("42")
  })

  it("should store offsets of different partition independently", async () => {
    logger.expect({ message: "Reading test-state from beginning" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets ,,24,,42" })
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState, "24", 2)
    state.set(singleState2, "42", 4)
    await state.saveCheckpoint()
    expect(state.getOffset(2)).toEqual("24")
    expect(state.getOffset(4)).toEqual("42")
  })

  it("should return the last checkpoint as the starting position if the state was created normally", async () => {
    logger.expect({ message: "Reading test from beginning" })
    logger.expect({ message: "Created state checkpoint for test with offsets 24" })
    logger.expect({ message: "Loaded checkpoint for test at offsets 24" })
    searchResult.getMany = vi.fn().mockResolvedValue([
      { key: "__offsets", state: JSON.stringify(["24"]) },
      { key: "42", state: JSON.stringify([singleState]) },
    ])
    const state = await createState<SingleState>("test", dataSource, keyFunc, true, logger)
    state.set(singleState, "24")
    await state.saveCheckpoint()
    const newState = await createState<SingleState>("test", dataSource, keyFunc, false, logger)
    expect(newState.getOffset(0)).toEqual("24")
  })

  it("should return the start position if the state was created without a checkpoint", async () => {
    logger.expect({ message: "Reading test from beginning" })
    const state = await createState<SingleState>("test", dataSource, keyFunc, true, logger)
    expect(state.getStartPos()).toEqual("start")
  })

  it("should delete the last checkpoint if the state was createed without a checkpoint", async () => {
    logger.expect({ message: "Reading test from beginning" })
    logger.expect({ message: "Created state checkpoint for test with offsets 24" })
    logger.expect({ message: "Loaded checkpoint for test at offsets 24" })
    const state = await createState<SingleState>("test", dataSource, keyFunc, true, logger)
    state.set(singleState, "24")
    await state.saveCheckpoint()
    const newState = await createState<SingleState>("test", dataSource, keyFunc, false, logger)
    expect(newState.getStartPos()).toEqual("checkpoint")
  })

  it("should persist the current state at latest 60 seconds after setting it", async () => {
    vi.useFakeTimers()
    logger.expect({ message: "Reading test-state from beginning" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets 42" })
    entityManager.insert = vi.fn()
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState, "42")
    vi.advanceTimersByTime(60_000)
    vi.useRealTimers()
    await new Promise(setImmediate) // flush Promises queue
    expect(entityManager.insert).toBeCalledTimes(2)
  })

  async function flushPromises() {
    vi.useRealTimers()
    await new Promise(setImmediate) // flush Promises queue
    vi.useFakeTimers()
  }

  it("should persist the current state at latest 60 seconds after deleting it", async () => {
    vi.useFakeTimers()
    logger.expect({ message: "Reading test-state from beginning" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets 42" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets 43" })
    entityManager.insert = vi.fn()
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState, "42")
    vi.advanceTimersByTime(60_000)
    await flushPromises()
    state.unset(singleState, "43")
    vi.advanceTimersByTime(60_000)
    await flushPromises()
    expect(entityManager.insert).toBeCalledTimes(4)
  })

  it("should save all checkpoints immediately when requested to", async () => {
    logger.expect({ message: "Reading test-state from beginning" })
    logger.expect({ message: "Created state checkpoint for test-state with offsets 42,24" })
    entityManager.insert = vi.fn()
    const state = await createState<SingleState>("test-state", dataSource, keyFunc, true, logger)
    state.set(singleState, "42", 0)
    state.set(singleState2, "24", 1)
    await saveAllCheckpoints()
  })
})

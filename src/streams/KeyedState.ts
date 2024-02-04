import { OffsetProvider } from "./OffsetProvider.js"
import { DataSource } from "typeorm"
import { KeyedStateEntity } from "./KeyedStateEntity.js"

interface Checkpointable {
  saveCheckpoint(): Promise<void>
}

export type State<T> = OffsetProvider &
  Checkpointable & {
    getByKey(key: string): T
    set(object: T, offset?: string, partition?: number): void
    unset(object: T, offset?: string, partition?: number): void
  }

const states: Checkpointable[] = []

type Logger = Pick<typeof console, "info" | "warn">

type KeyFunc<T> = (object: T) => string

export async function createState<T>(
  id: string,
  dataSource: DataSource,
  keyFunc: KeyFunc<T>,
  withoutCheckpoint = false,
  logger: Logger = console,
) {
  const stateRepository = dataSource.getRepository(KeyedStateEntity)
  let timer: NodeJS.Timeout | undefined
  let state: Record<string, T> = {}
  let offsets: string[] | undefined
  let dirty = false

  if (withoutCheckpoint) {
    await deleteCheckpoints()
    logger.info(`Reading ${id} from beginning`)
  } else {
    await loadLatestCheckpoint()
  }

  const result: State<T> = {
    getOffset(partition: number) {
      return offsets ? offsets[partition] : "0"
    },

    setOffset(partition: number, newOffset: string) {
      if (!offsets) {
        offsets = []
      }
      offsets[partition] = newOffset
      dirty = true
    },

    getStartPos() {
      return withoutCheckpoint ? "start" : "checkpoint"
    },

    getByKey(key: string) {
      return state[key]
    },

    set(object: T, offset?: string, partition = 0) {
      state[keyFunc(object)] = object
      if (offset) {
        this.setOffset(partition, offset)
      }
      dirty = true
      timeCheckpoint()
    },

    unset(object: T, offset?: string, partition = 0) {
      delete state[keyFunc(object)]
      if (offset) {
        this.setOffset(partition, offset)
      }
      dirty = true
      timeCheckpoint()
    },

    saveCheckpoint,
  }

  states.push(result)
  return result

  async function loadLatestCheckpoint() {
    const stateEntries = await stateRepository.createQueryBuilder("state").where({ id }).getMany()

    if (stateEntries.length === 0) {
      logger.warn(`No state found for ${id}`)
      withoutCheckpoint = true
    } else {
      state = Object.fromEntries(
        stateEntries
          .filter(state => state.key !== "__offsets")
          .map(state => [state.key, JSON.parse(state.state)]),
      )
      offsets = JSON.parse(stateEntries.find(state => state.key === "__offsets")?.state as string)
      logger.info(`Loaded checkpoint for ${id} at offsets ${offsets}`)
    }
  }

  async function saveCheckpoint() {
    if (!offsets || !dirty) {
      return // Don't checkpoint if there are no offsets yet or if there are no changes
    }
    await stateRepository.manager.transaction(async em => {
      const entities = Object.entries(state).map(
        ([key, state]) => new KeyedStateEntity(id, key, JSON.stringify(state)),
      )
      const offsetsEntity = new KeyedStateEntity(id, "__offsets", JSON.stringify(offsets))
      await em.delete(KeyedStateEntity, { id })
      await em.insert(KeyedStateEntity, entities)
      await em.insert(KeyedStateEntity, offsetsEntity)
      logger.info(`Created state checkpoint for ${id} with offsets ${offsets}`)
    })
    dirty = false
  }

  async function deleteCheckpoints() {
    await stateRepository.delete({ id })
  }

  function timeCheckpoint() {
    if (!timer) {
      timer = setTimeout(async () => {
        timer = undefined
        await saveCheckpoint()
      }, 60_000)
    }
  }
}

export async function saveAllCheckpoints() {
  await Promise.all(states.map(async state => await state.saveCheckpoint()))
  states.length = 0
}

import { describe, expect, it, vi } from "vitest"
import { createDatabaseSink } from "./DatabaseSink.js"
import { DataSource, Repository } from "typeorm"
import { createCSVSource } from "./CSVSource.js"
import { Readable } from "stream"
import { KeyedStateEntity } from "./KeyedStateEntity.js"

function keyFunc(test: KeyedStateEntity) {
  return { id: test.id }
}

describe("DatabaseSink", () => {
  it("should do insert calls for new entries", async () => {
    const repository = createRepository(0)
    await runPipeline(`id,name\n1,Joachim`, repository)
    expect(repository.insert).toBeCalledWith({ id: "1", name: "Joachim" })
  })

  it("should do update statements for existing entries", async () => {
    const repository = createRepository(1)
    await runPipeline(`id,name\n1,Joachim`, repository)
    expect(repository.insert).not.toBeCalled()
    expect(repository.update).toBeCalledWith({ id: "1" }, { id: "1", name: "Joachim" })
  })

  it("should do insert statements even for existing entries when in 'append' mode", async () => {
    const repository = createRepository(1)
    await runPipeline(`id,name\n1,Joachim`, repository, true)
    expect(repository.insert).toBeCalledWith({ id: "1", name: "Joachim" })
    expect(repository.update).not.toBeCalled()
  })
})

async function runPipeline(data: string, repository: Repository<KeyedStateEntity>, append = false) {
  await new Promise((resolve, reject) =>
    createCSVSource({ readStream: Readable.from(data) })
      .run()
      .stream.pipe(
        createDatabaseSink(createDataSource(repository), KeyedStateEntity, keyFunc, append),
      )
      .on("close", () => resolve(undefined))
      .on("error", reject),
  )
}

function createRepository(affected: number) {
  return {
    insert: vi.fn(),
    update: vi.fn().mockResolvedValue({ affected }),
  } as unknown as Repository<KeyedStateEntity>
}

function createDataSource(repository: Repository<KeyedStateEntity>) {
  return {
    getRepository: vi.fn(() => repository),
  } as unknown as DataSource
}

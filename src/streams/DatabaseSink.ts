import { Writable } from "stream"
import type {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
} from "typeorm"

type KeyFunc<T extends ObjectLiteral> = (obj: T) => FindOptionsWhere<T>

export async function getDataSource(ormConfig: DataSourceOptions) {
  const { DataSource } = await import("typeorm")
  const dataSource = new DataSource(ormConfig)
  await dataSource.initialize()
  await dataSource.showMigrations()
  return dataSource
}

export function createDatabaseSink<T extends ObjectLiteral>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
  keyFunc: KeyFunc<T>,
  append = false,
) {
  const repository = dataSource.getRepository<T>(entity)
  return new Writable({
    objectMode: true,
    async write(event: T, encoding, done) {
      if (!append) {
        const where = keyFunc(event)
        const result = await repository.update(where, event)
        if (result.affected! > 0) {
          return done()
        }
      }
      await repository.insert(event)
      done()
    },
  })
}

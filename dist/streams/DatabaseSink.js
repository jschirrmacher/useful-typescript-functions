"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSource = getDataSource;
exports.createDatabaseSink = createDatabaseSink;
const stream_1 = require("stream");
async function getDataSource(ormConfig) {
    const { DataSource } = await import("typeorm");
    const dataSource = new DataSource(ormConfig);
    await dataSource.initialize();
    await dataSource.showMigrations();
    return dataSource;
}
function createDatabaseSink(dataSource, entity, keyFunc, append = false) {
    const repository = dataSource.getRepository(entity);
    return new stream_1.Writable({
        objectMode: true,
        async write(event, encoding, done) {
            if (!append) {
                const where = keyFunc(event);
                const result = await repository.update(where, event);
                if (result.affected > 0) {
                    return done();
                }
            }
            await repository.insert(event);
            done();
        },
    });
}
//# sourceMappingURL=DatabaseSink.js.map
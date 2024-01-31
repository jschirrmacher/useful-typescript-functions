"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseSink = exports.getDataSource = void 0;
const stream_1 = require("stream");
async function getDataSource(ormConfig) {
    const { DataSource } = await import("typeorm");
    const dataSource = new DataSource(ormConfig);
    await dataSource.initialize();
    await dataSource.showMigrations();
    return dataSource;
}
exports.getDataSource = getDataSource;
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
exports.createDatabaseSink = createDatabaseSink;
//# sourceMappingURL=DatabaseSink.js.map
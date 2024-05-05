"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const DatabaseSink_js_1 = require("./DatabaseSink.js");
const CSVSource_js_1 = require("./CSVSource.js");
const stream_1 = require("stream");
const KeyedStateEntity_js_1 = require("./KeyedStateEntity.js");
function keyFunc(test) {
    return { id: test.id };
}
(0, vitest_1.describe)("DatabaseSink", () => {
    (0, vitest_1.it)("should do insert calls for new entries", async () => {
        const repository = createRepository(0);
        await runPipeline(`id,name\n1,Joachim`, repository);
        (0, vitest_1.expect)(repository.insert).toBeCalledWith({ id: "1", name: "Joachim" });
    });
    (0, vitest_1.it)("should do update statements for existing entries", async () => {
        const repository = createRepository(1);
        await runPipeline(`id,name\n1,Joachim`, repository);
        (0, vitest_1.expect)(repository.insert).not.toBeCalled();
        (0, vitest_1.expect)(repository.update).toBeCalledWith({ id: "1" }, { id: "1", name: "Joachim" });
    });
    (0, vitest_1.it)("should do insert statements even for existing entries when in 'append' mode", async () => {
        const repository = createRepository(1);
        await runPipeline(`id,name\n1,Joachim`, repository, true);
        (0, vitest_1.expect)(repository.insert).toBeCalledWith({ id: "1", name: "Joachim" });
        (0, vitest_1.expect)(repository.update).not.toBeCalled();
    });
});
async function runPipeline(data, repository, append = false) {
    await new Promise((resolve, reject) => (0, CSVSource_js_1.createCSVSource)({ readStream: stream_1.Readable.from(data) })
        .run()
        .stream.pipe((0, DatabaseSink_js_1.createDatabaseSink)(createDataSource(repository), KeyedStateEntity_js_1.KeyedStateEntity, keyFunc, append))
        .on("close", () => resolve(undefined))
        .on("error", reject));
}
function createRepository(affected) {
    return {
        insert: vitest_1.vi.fn(),
        update: vitest_1.vi.fn().mockResolvedValue({ affected }),
    };
}
function createDataSource(repository) {
    return {
        getRepository: vitest_1.vi.fn(() => repository),
    };
}
//# sourceMappingURL=DatabaseSink.test.js.map
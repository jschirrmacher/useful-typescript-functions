"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const KeyedStateMigration_js_1 = require("./KeyedStateMigration.js");
const queryRunner = {
    createTable: vitest_1.vi.fn(),
    dropTable: vitest_1.vi.fn()
};
(0, vitest_1.describe)("KeyedStateMigration", () => {
    (0, vitest_1.it)("should create the table if up() is called", async () => {
        const migration = new KeyedStateMigration_js_1.KeyedStateMigration();
        await migration.up(queryRunner);
        (0, vitest_1.expect)(queryRunner.createTable).toBeCalledWith(vitest_1.expect.objectContaining({ name: "keyedstate" }), true);
    });
    (0, vitest_1.it)("should drop the table if down() is called", async () => {
        const migration = new KeyedStateMigration_js_1.KeyedStateMigration();
        await migration.down(queryRunner);
        (0, vitest_1.expect)(queryRunner.dropTable).toBeCalledWith("keyedstate");
    });
});
//# sourceMappingURL=KeyedStateMigration.test.js.map
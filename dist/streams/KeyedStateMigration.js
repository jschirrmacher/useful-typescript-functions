"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyedStateMigration = void 0;
const typeorm_1 = require("typeorm");
class KeyedStateMigration {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "keyedstate",
            columns: [
                { name: "id", type: "text", isNullable: false, isPrimary: true },
                { name: "key", type: "text", isNullable: false, isPrimary: true },
                { name: "state", type: "text", isNullable: false },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("keyedstate");
    }
}
exports.KeyedStateMigration = KeyedStateMigration;
//# sourceMappingURL=KeyedStateMigration.js.map
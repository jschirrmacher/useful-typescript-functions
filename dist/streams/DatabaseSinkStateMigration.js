"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSinkStateMigration = void 0;
class DatabaseSinkStateMigration {
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "dbsinkstate" (
      "id" text NOT NULL,
      "key" text NOT NULL,
      "state" text NOT NULL,
      CONSTRAINT "PK_state_id_key" PRIMARY KEY ("id", "key")
    )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "dbsinkstate"`);
    }
}
exports.DatabaseSinkStateMigration = DatabaseSinkStateMigration;
//# sourceMappingURL=DatabaseSinkStateMigration.js.map
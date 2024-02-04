"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyedStateMigration = void 0;
class KeyedStateMigration {
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "keyedstate" (
      "id" text NOT NULL,
      "key" text NOT NULL,
      "state" text NOT NULL,
      CONSTRAINT "PK_state_id_key" PRIMARY KEY ("id", "key")
    )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "keyedstate"`);
    }
}
exports.KeyedStateMigration = KeyedStateMigration;
//# sourceMappingURL=KeyedStateMigration.js.map
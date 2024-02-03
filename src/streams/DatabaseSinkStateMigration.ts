import { MigrationInterface, QueryRunner } from "typeorm"

export class DatabaseSinkStateMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner) {
    await queryRunner.query(`CREATE TABLE "dbsinkstate" (
      "id" text NOT NULL,
      "key" text NOT NULL,
      "state" text NOT NULL,
      CONSTRAINT "PK_state_id_key" PRIMARY KEY ("id", "key")
    )`)
  }

  public async down(queryRunner: QueryRunner) {
    await queryRunner.query(`DROP TABLE "dbsinkstate"`)
  }
}

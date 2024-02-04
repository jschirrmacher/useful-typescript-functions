import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class KeyedStateMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "keyedstate",
        columns: [
          { name: "id", type: "text", isNullable: false, isPrimary: true },
          { name: "key", type: "text", isNullable: false, isPrimary: true },
          { name: "state", type: "text", isNullable: false },
        ],
      }),
      true,
    )
  }

  public async down(queryRunner: QueryRunner) {
    await queryRunner.dropTable("keyedstate")
  }
}

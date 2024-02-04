import { describe, expect, it, vi } from "vitest"
import { KeyedStateMigration } from "./KeyedStateMigration.js"
import { QueryRunner } from "typeorm"

const queryRunner = {
  createTable: vi.fn(),
  dropTable: vi.fn()
}

describe("KeyedStateMigration", () => {
  it("should create the table if up() is called", async () => {
    const migration = new KeyedStateMigration()
    await migration.up(queryRunner as unknown as QueryRunner)
    expect(queryRunner.createTable).toBeCalledWith(expect.objectContaining({ name: "keyedstate" }), true)
  })

  it("should drop the table if down() is called", async () => {
    const migration = new KeyedStateMigration()
    await migration.down(queryRunner as unknown as QueryRunner)
    expect(queryRunner.dropTable).toBeCalledWith("keyedstate")
  })
})

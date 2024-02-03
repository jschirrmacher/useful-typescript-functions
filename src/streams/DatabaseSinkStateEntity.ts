import { Column, Entity, ObjectLiteral } from "typeorm"

@Entity({ name: "dbsinkstate" })
export class DatabaseSinkStateEntity implements ObjectLiteral {
  @Column({ type: "text", primary: true })
  id!: string

  @Column({ type: "text", primary: true })
  key!: string

  @Column({ type: "text" })
  state!: string

  constructor(id?: string, key?: string, state?: string) {
    this.id = id!
    this.key = key!
    this.state = state!
  }
}

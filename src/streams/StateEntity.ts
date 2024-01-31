import { Column, Entity, ObjectLiteral } from "typeorm"

@Entity({ name: "state" })
export class StateEntity implements ObjectLiteral {
  @Column({ type: "text", primary: true })
  id!: string

  @Column({ type: "text", primary: true })
  key!: string

  @Column({ type: "text" })
  state!: string
}

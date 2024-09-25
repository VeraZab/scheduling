import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { NurseEntity } from "../nurse/nurse.entity";
import { DayOfWeek, ShiftType } from "../shift/shift.entity";

@Entity("preferences")
export class PreferenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  dayOfWeek: DayOfWeek;

  @Column({ type: "varchar", length: 10 })
  shiftType: ShiftType;

  @ManyToOne(() => NurseEntity, (nurse) => nurse.preferences)
  nurse: NurseEntity;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

import { NurseEntity } from "../nurse/nurse.entity";
import { ScheduleEntity } from "../schedule/schedule.entity";

export type ShiftType = "day" | "night";
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ShiftRequirements = {
  shift: ShiftType;
  nursesRequired: number;
  dayOfWeek: string;
};

@Entity("shifts")
export class ShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  dayOfWeek: DayOfWeek;

  @Column({ type: "varchar", length: 10 })
  type: ShiftType;

  @ManyToOne(() => NurseEntity, (nurse) => nurse.shifts, { eager: true })
  nurse: NurseEntity;

  @ManyToOne(() => ScheduleEntity, (schedule) => schedule.shifts)
  schedule: ScheduleEntity;
}

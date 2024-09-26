import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { ShiftEntity } from "../shift/shift.entity";

@Entity("schedules")
export class ScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @OneToMany(() => ShiftEntity, (shift) => shift.schedule, {
    eager: true,
  })
  shifts: ShiftEntity[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}

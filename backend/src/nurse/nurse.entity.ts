import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { ShiftEntity } from "../shift/shift.entity";
import { PreferenceEntity } from "../preference/preference.entity";

@Entity("nurses")
export class NurseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @OneToMany(() => PreferenceEntity, (preference) => preference.nurse)
  preferences: PreferenceEntity[];

  @OneToMany(() => ShiftEntity, (shift) => shift.nurse)
  shifts: ShiftEntity[];
}

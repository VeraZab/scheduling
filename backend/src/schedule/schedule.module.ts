import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleService } from "./schedule.service";
import { ScheduleController } from "./schedule.controller";
import { ScheduleEntity } from "./schedule.entity";
import { ShiftModule } from "../shift/shift.module";
import { PreferenceModule } from "../preference/preference.module";
import { NurseModule } from "../nurse/nurse.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleEntity]),
    ShiftModule,
    PreferenceModule,
    NurseModule,
  ],
  exports: [TypeOrmModule],
  providers: [ScheduleService],
  controllers: [ScheduleController],
})
export class ScheduleModule {}

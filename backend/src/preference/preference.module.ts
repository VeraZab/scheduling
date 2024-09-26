import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PreferenceEntity } from "./preference.entity";
import { PreferenceService } from "./preference.service";
import { PreferenceController } from "./preference.controller";
import { NurseEntity } from "../nurse/nurse.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PreferenceEntity, NurseEntity])],
  providers: [PreferenceService],
  controllers: [PreferenceController],
  exports: [PreferenceService, TypeOrmModule],
})
export class PreferenceModule {}

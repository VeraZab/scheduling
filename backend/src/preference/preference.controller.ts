import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { PreferenceService } from "./preference.service";
import { PreferenceEntity } from "./preference.entity";
import { ShiftType } from "../shift/shift.entity";

@Controller("preferences")
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post(":nurseId")
  async setPreferences(
    @Param("nurseId") nurseId: number,
    @Body("preferences")
    preferences: { dayOfWeek: string; shiftType: ShiftType }[] // Use ShiftType for validation
  ): Promise<PreferenceEntity[]> {
    return this.preferenceService.setPreferences(nurseId, preferences);
  }

  @Get(":nurseId")
  async getPreferences(
    @Param("nurseId") nurseId: number
  ): Promise<PreferenceEntity[]> {
    return this.preferenceService.getPreferences(nurseId);
  }
}

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotImplementedException,
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";

@Controller("schedules")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedules(): Promise<any> {
    return this.scheduleService.getSchedules();
  }

  @Get("/:id")
  async getSchedule(@Param("id") id: number): Promise<any> {
    return this.scheduleService.getScheduleById(id);
  }

  @Post()
  async generateSchedule(): Promise<any> {
    return this.scheduleService.generateSchedule();
  }
}

import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { NurseService } from "./nurse.service";
import { NurseEntity } from "./nurse.entity";

@Controller("nurses")
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @Get()
  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseService.getNurses();
  }
}

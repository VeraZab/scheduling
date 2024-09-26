import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScheduleEntity } from "./schedule.entity";
import { ShiftService } from "../shift/shift.service";
import { PreferenceService } from "../preference/preference.service";
import { NurseService } from "../nurse/nurse.service";
import { shuffleArray } from "../utils/array";
import {
  DayOfWeek,
  ShiftRequirements,
  ShiftType,
  ShiftEntity,
} from "../shift/shift.entity";

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(ShiftEntity) // Add this line to inject shiftRepository
    private readonly shiftRepository: Repository<ShiftEntity>,

    private readonly shiftService: ShiftService,
    private readonly preferenceService: PreferenceService,
    private readonly nurseService: NurseService
  ) {}

  async generateSchedule(startDate: Date, endDate: Date): Promise<any> {
    // Create a new schedule entity
    const newSchedule = this.scheduleRepository.create();
    await this.scheduleRepository.save(newSchedule);

    const requirements = await this.getScheduleRequirements();
    const totalShiftsAvailable = requirements.reduce(
      (total: number, req: ShiftRequirements) => {
        return total + req.nursesRequired;
      },
      0
    );
    const nurses = await this.nurseService.getNurses();
    const fairNumShiftsPerNurse = Math.floor(
      totalShiftsAvailable / nurses.length
    );
    // shuffle the nurses array to give everyone a fair chance of being first considered
    // for priority treatment
    const shuffledNurses = shuffleArray(nurses);
    const shifts: Partial<ShiftEntity>[] = [];
    const nurseShiftCounter = nurses.reduce((acc: any, nurse: any) => {
      acc[nurse.id] = 0;
      return acc;
    }, {});
    const easyLookupRequirements = requirements.reduce(
      (acc: any, curr: any) => {
        const { dayOfWeek, shift, nursesRequired } = curr;
        if (!acc[dayOfWeek]) acc[dayOfWeek] = {};
        acc[dayOfWeek][shift] = nursesRequired;
        return acc;
      },
      {}
    );

    const scheduleVerification = {
      Monday: {
        day: 0,
        night: 0,
      },
      Tuesday: {
        day: 0,
        night: 0,
      },
      Wednesday: {
        day: 0,
        night: 0,
      },
      Thursday: {
        day: 0,
        night: 0,
      },
      Friday: {
        day: 0,
        night: 0,
      },
      Saturday: {
        day: 0,
        night: 0,
      },
      Sunday: {
        day: 0,
        night: 0,
      },
    };

    // Try to give each nurse their prefered schedule if its available
    // and they didn't max out their shift number
    for (const nurse of nurses) {
      const nursePreferences = await this.preferenceService.getPreferences(
        nurse.id
      );

      nursePreferences.forEach((shift) => {
        if (
          scheduleVerification[shift.dayOfWeek][shift.shiftType] <
            easyLookupRequirements[shift.dayOfWeek][shift.shiftType] &&
          nurseShiftCounter[nurse.id] < fairNumShiftsPerNurse
        ) {
          shifts.push({
            nurse: nurse,
            dayOfWeek: shift.dayOfWeek,
            type: shift.shiftType,
            schedule: newSchedule,
          });
          scheduleVerification[shift.dayOfWeek][shift.shiftType] += 1;
          nurseShiftCounter[nurse.id] += 1;
        }
      });
    }

    // Check if schedule requirements are met
    Object.keys(scheduleVerification).forEach((day) => {
      const shiftsForDay = scheduleVerification[day as DayOfWeek];
      Object.keys(shiftsForDay).forEach((shiftType) => {
        const requiredNurses =
          easyLookupRequirements[day][shiftType as ShiftType];
        const assignedNurses = shiftsForDay[shiftType as ShiftType];
        // Assign unfulfilled shifts to nurses who haven't reached their fair shift count
        while (assignedNurses < requiredNurses) {
          const nurseToAssign = shuffledNurses.find(
            (nurse) => nurseShiftCounter[nurse.id] < fairNumShiftsPerNurse
          );
          if (nurseToAssign) {
            shifts.push({
              nurse: nurseToAssign,
              dayOfWeek: day as DayOfWeek,
              type: shiftType as ShiftType,
              schedule: newSchedule,
            });
            scheduleVerification[day as DayOfWeek][shiftType as ShiftType] += 1;
            nurseShiftCounter[nurseToAssign.id] += 1;
          } else {
            // If all nurses have fair shifts, assign a random nurse to the remaining shift
            const randomNurse =
              shuffledNurses[Math.floor(Math.random() * shuffledNurses.length)];
            shifts.push({
              nurse: randomNurse,
              dayOfWeek: day as DayOfWeek,
              type: shiftType as ShiftType,
              schedule: newSchedule,
            });
            scheduleVerification[day as DayOfWeek][shiftType as ShiftType] += 1;
            nurseShiftCounter[randomNurse.id] += 1;
          }
        }
      });
    });

    // Save the shifts in the database
    await this.shiftRepository.save(shifts);
  }

  async getSchedules(): Promise<any> {
    return this.scheduleRepository.find();
  }

  async getScheduleById(id: number): Promise<any> {
    return this.scheduleRepository.findOneByOrFail({ id });
  }

  async getScheduleRequirements(): Promise<any> {
    return this.shiftService.getShiftRequirements();
  }
}

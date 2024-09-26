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

    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>,

    private readonly shiftService: ShiftService,
    private readonly preferenceService: PreferenceService,
    private readonly nurseService: NurseService
  ) {}

  async generateSchedule(): Promise<any> {
    // Create a new schedule entity
    const newSchedule = this.scheduleRepository.create();
    await this.scheduleRepository.save(newSchedule);

    const requirements = await this.getScheduleRequirements();
    // make a hash of requirements to more easily lookup the number of
    // required nurses for each shift
    const easyLookupRequirements = requirements.reduce(
      (acc: any, curr: any) => {
        const { dayOfWeek, shift, nursesRequired } = curr;
        if (!acc[dayOfWeek]) acc[dayOfWeek] = {};
        acc[dayOfWeek][shift] = nursesRequired;
        return acc;
      },
      {}
    );
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
    // Keep track of number of times a nurse is assigned to not over assign them
    const nurseShiftCounter = nurses.reduce((acc: any, nurse: any) => {
      acc[nurse.id] = 0;
      return acc;
    }, {});
    // Track which nurse is assigned to which shift for a given day to not double book
    // same nurse on same day
    const nurseDayAssignment: {
      [key: number]: { [key in DayOfWeek]?: ShiftType };
    } = {};

    const shifts: Partial<ShiftEntity>[] = [];

    // Keep track of the number of shifts assigned each day to compare with requirements
    const assignedShifts = {
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
          !nurseDayAssignment[nurse.id]?.[shift.dayOfWeek] &&
          assignedShifts[shift.dayOfWeek][shift.shiftType] <
            easyLookupRequirements[shift.dayOfWeek][shift.shiftType] &&
          nurseShiftCounter[nurse.id] < fairNumShiftsPerNurse
        ) {
          shifts.push({
            nurse: nurse,
            dayOfWeek: shift.dayOfWeek,
            type: shift.shiftType,
            schedule: newSchedule,
          });
          // Mark that the nurse has a shift on this day
          nurseDayAssignment[nurse.id] = {
            ...nurseDayAssignment[nurse.id],
            [shift.dayOfWeek]: shift.shiftType,
          };
          assignedShifts[shift.dayOfWeek][shift.shiftType] += 1;
          nurseShiftCounter[nurse.id] += 1;
        }
      });
    }

    // Check if schedule requirements are met
    Object.keys(easyLookupRequirements).forEach((day) => {
      const shiftsForDay = easyLookupRequirements[day as DayOfWeek];

      Object.keys(shiftsForDay).forEach((shiftType) => {
        // Assign unfulfilled shifts to nurses who haven't reached their fair shift count
        while (
          assignedShifts[day as DayOfWeek][shiftType as ShiftType] <
          easyLookupRequirements[day][shiftType as ShiftType]
        ) {
          const nurseToAssign = shuffledNurses.find(
            (nurse) =>
              nurseShiftCounter[nurse.id] < fairNumShiftsPerNurse &&
              !nurseDayAssignment[nurse.id]?.[day as DayOfWeek]
          );

          if (nurseToAssign) {
            shifts.push({
              nurse: nurseToAssign,
              dayOfWeek: day as DayOfWeek,
              type: shiftType as ShiftType,
              schedule: newSchedule,
            });

            // Mark that the nurse has a shift on this day
            nurseDayAssignment[nurseToAssign.id] = {
              ...nurseDayAssignment[nurseToAssign.id],
              [day as DayOfWeek]: shiftType as ShiftType,
            };
            // add a shift to that nurse's total shift counter
            nurseShiftCounter[nurseToAssign.id] += 1;
            // Increase the number of assigned shifts for that day and shiftType
            assignedShifts[day as DayOfWeek][shiftType as ShiftType] += 1;
          } else {
            // If all nurses have fair shifts, assign a random nurse to the remaining shift
            const randomNurse = shuffledNurses.find(
              (nurse) => !nurseDayAssignment[nurse.id]?.[day as DayOfWeek]
            );

            if (randomNurse) {
              shifts.push({
                nurse: randomNurse,
                dayOfWeek: day as DayOfWeek,
                type: shiftType as ShiftType,
                schedule: newSchedule,
              });

              // Mark that the nurse has a shift on this day
              nurseDayAssignment[randomNurse.id] = {
                ...nurseDayAssignment[randomNurse.id],
                [day as DayOfWeek]: shiftType as ShiftType,
              };
              nurseShiftCounter[randomNurse.id] += 1;
              assignedShifts[day as DayOfWeek][shiftType as ShiftType] += 1;
            }
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

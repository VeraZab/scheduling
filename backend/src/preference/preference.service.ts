import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PreferenceEntity } from "./preference.entity";
import { NurseEntity } from "../nurse/nurse.entity";
import { ShiftType } from "../shift/shift.entity";

@Injectable()
export class PreferenceService {
  constructor(
    @InjectRepository(PreferenceEntity)
    private readonly preferenceRepository: Repository<PreferenceEntity>,

    @InjectRepository(NurseEntity)
    private readonly nurseRepository: Repository<NurseEntity>
  ) {}

  async setPreferences(
    nurseId: number,
    preferences: { dayOfWeek: string; shiftType: ShiftType }[]
  ): Promise<PreferenceEntity[]> {
    const nurse = await this.nurseRepository.findOneByOrFail({ id: nurseId });
    if (!nurse) {
      throw new Error(`Nurse with ID ${nurseId} not found`);
    }

    // Delete existing preferences
    // This is not ideal, but for simplicity's sake keeping it like that
    // to focus more on scheduling part. It's not a terrible solution as
    // there's only a max of 7 preferences to delete/recreate, but ideally
    // we'd only be updating the changed preferences
    await this.preferenceRepository.delete({ nurse });

    const newPreferences = preferences.map((preference) => {
      return this.preferenceRepository.create({
        dayOfWeek: preference.dayOfWeek,
        shiftType: preference.shiftType,
        nurse,
      });
    });

    return this.preferenceRepository.save(newPreferences);
  }

  async getPreferences(nurseId: number): Promise<PreferenceEntity[]> {
    const nurse = await this.nurseRepository.findOneByOrFail({ id: nurseId });
    if (!nurse) {
      throw new Error(`Nurse with ID ${nurseId} not found`);
    }

    return this.preferenceRepository.find({
      where: { nurse },
      relations: ["nurse"],
    });
  }
}

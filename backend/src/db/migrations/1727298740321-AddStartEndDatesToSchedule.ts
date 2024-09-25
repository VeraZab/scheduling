import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartEndDatesToSchedule1727298740321 implements MigrationInterface {
    name = 'AddStartEndDatesToSchedule1727298740321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`schedules\` ADD \`startDate\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`schedules\` ADD \`endDate\` date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`schedules\` DROP COLUMN \`endDate\``);
        await queryRunner.query(`ALTER TABLE \`schedules\` DROP COLUMN \`startDate\``);
    }

}

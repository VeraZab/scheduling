import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStartEndDates1727354767126 implements MigrationInterface {
    name = 'RemoveStartEndDates1727354767126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`schedules\` DROP COLUMN \`startDate\``);
        await queryRunner.query(`ALTER TABLE \`schedules\` DROP COLUMN \`endDate\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`schedules\` ADD \`endDate\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`schedules\` ADD \`startDate\` date NOT NULL`);
    }

}

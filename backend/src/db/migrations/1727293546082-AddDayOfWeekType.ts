import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayOfWeekType1727293546082 implements MigrationInterface {
    name = 'AddDayOfWeekType1727293546082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shifts\` CHANGE \`date\` \`dayOfWeek\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`shifts\` DROP COLUMN \`dayOfWeek\``);
        await queryRunner.query(`ALTER TABLE \`shifts\` ADD \`dayOfWeek\` varchar(10) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shifts\` DROP COLUMN \`dayOfWeek\``);
        await queryRunner.query(`ALTER TABLE \`shifts\` ADD \`dayOfWeek\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`shifts\` CHANGE \`dayOfWeek\` \`date\` date NOT NULL`);
    }

}

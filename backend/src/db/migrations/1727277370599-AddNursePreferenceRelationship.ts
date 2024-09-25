import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNursePreferenceRelationship1727277370599 implements MigrationInterface {
    name = 'AddNursePreferenceRelationship1727277370599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`preferences\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dayOfWeek\` varchar(10) NOT NULL, \`shiftType\` varchar(10) NOT NULL, \`nurseId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nurses\` DROP COLUMN \`preferences\``);
        await queryRunner.query(`ALTER TABLE \`preferences\` ADD CONSTRAINT \`FK_63355b9b9349dc46c4cd1cf3233\` FOREIGN KEY (\`nurseId\`) REFERENCES \`nurses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`preferences\` DROP FOREIGN KEY \`FK_63355b9b9349dc46c4cd1cf3233\``);
        await queryRunner.query(`ALTER TABLE \`nurses\` ADD \`preferences\` json NULL`);
        await queryRunner.query(`DROP TABLE \`preferences\``);
    }

}

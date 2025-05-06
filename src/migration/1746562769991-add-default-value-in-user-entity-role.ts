import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultValueInUserEntityRole1746562769991 implements MigrationInterface {
    name = 'AddDefaultValueInUserEntityRole1746562769991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'Employee'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    }

}

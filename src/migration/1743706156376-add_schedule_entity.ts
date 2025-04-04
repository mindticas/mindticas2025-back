import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduleEntity1743706156376 implements MigrationInterface {
    name = 'AddScheduleEntity1743706156376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule" ("id" SERIAL NOT NULL, "day" character varying NOT NULL, "open_hours" text array NOT NULL, CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "schedule"`);
    }

}

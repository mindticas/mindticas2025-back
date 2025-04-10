import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexInDayField1744052044356 implements MigrationInterface {
    name = 'AddUniqueIndexInDayField1744052044356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_day" ON "schedule" ("day") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."unique_day"`);
    }

}

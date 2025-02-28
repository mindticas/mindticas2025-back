import { MigrationInterface, QueryRunner } from "typeorm";

export class MakesNamePropertyOfTreatmentEntityUnique1740512621075 implements MigrationInterface {
    name = 'MakesNamePropertyOfTreatmentEntityUnique1740512621075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "treatment" ADD CONSTRAINT "UQ_30dffe299fe6ba8c1718fa93d81" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "treatment" DROP CONSTRAINT "UQ_30dffe299fe6ba8c1718fa93d81"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTipAmountAndSalesAmountFieldsInAppointmentEntity1746924555719 implements MigrationInterface {
    name = 'AddTipAmountAndSalesAmountFieldsInAppointmentEntity1746924555719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD "tipAmount" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "salesAmount" numeric(5,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "salesAmount"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "tipAmount"`);
    }

}

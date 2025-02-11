import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePriceToFloatAndRelationCustomersToApointmentsOneToOne1739293675703 implements MigrationInterface {
    name = 'ChangePriceToFloatAndRelationCustomersToApointmentsOneToOne1739293675703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "total_price" TYPE numeric(7,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "total_price" TYPE numeric(6,2)`);
    }

}

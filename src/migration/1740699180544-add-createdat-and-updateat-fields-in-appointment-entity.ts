import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedatAndUpdateatFieldsInAppointmentEntity1740699180544 implements MigrationInterface {
    name = 'AddCreatedatAndUpdateatFieldsInAppointmentEntity1740699180544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD "created_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "update_at" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "update_at"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "created_at"`);
    }

}

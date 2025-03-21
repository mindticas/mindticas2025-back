import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeScheduledatToScheduledstartInAppointmentEntity1740170271079 implements MigrationInterface {
    name = 'ChangeScheduledatToScheduledstartInAppointmentEntity1740170271079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" RENAME COLUMN "scheduled_at" TO "scheduled_start"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" RENAME COLUMN "scheduled_start" TO "scheduled_at"`);
    }

}

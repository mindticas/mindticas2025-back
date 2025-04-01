import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmenteventIdAndCreateGoogleTokenEntity1743529941664 implements MigrationInterface {
    name = 'AddAppointment.eventIdAndCreateGoogleTokenEntity1743529941664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "google_token" ("id" SERIAL NOT NULL, "accountId" character varying(100) NOT NULL, "refreshToken" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1da1f7a9bbe530f40146d34ac40" PRIMARY KEY ("id", "accountId"))`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "eventId" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "eventId"`);
        await queryRunner.query(`DROP TABLE "google_token"`);
    }

}

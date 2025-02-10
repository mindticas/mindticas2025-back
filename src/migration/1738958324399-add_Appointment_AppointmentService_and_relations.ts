import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmentAppointmentServiceAndRelations1738958324399 implements MigrationInterface {
    name = 'AddAppointmentAppointmentServiceAndRelations1738958324399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointment_service" ("id" SERIAL NOT NULL, "appointmentId" integer, CONSTRAINT "PK_a170b01d5845a629233fb80a51a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "user_id" integer NOT NULL, "total_price" integer NOT NULL, "duration" integer NOT NULL, "customerId" integer NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointment_service" ADD CONSTRAINT "FK_040c82b23e660475d29615eaac5" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_c048c6004b69354f46183f93a85" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_c048c6004b69354f46183f93a85"`);
        await queryRunner.query(`ALTER TABLE "appointment_service" DROP CONSTRAINT "FK_040c82b23e660475d29615eaac5"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "appointment_service"`);
    }

}

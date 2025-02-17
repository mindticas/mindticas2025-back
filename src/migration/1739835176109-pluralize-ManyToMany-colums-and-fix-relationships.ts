import { MigrationInterface, QueryRunner } from "typeorm";

export class PluralizeManyToManyColumsAndFixRelationships1739835176109 implements MigrationInterface {
    name = 'PluralizeManyToManyColumsAndFixRelationships1739835176109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "total_price" numeric(7,2) NOT NULL, "duration" integer NOT NULL, "userId" integer, "customerId" integer, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" numeric(6,2) NOT NULL, "duration" integer NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "roleId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_services_service" ("appointmentId" integer NOT NULL, "serviceId" integer NOT NULL, CONSTRAINT "PK_af8047314c8290ffc59fa8b8128" PRIMARY KEY ("appointmentId", "serviceId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_068bb879d26fb9346383fa611b" ON "appointment_services_service" ("appointmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c22108412ee27973c0d93235b" ON "appointment_services_service" ("serviceId") `);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_c048c6004b69354f46183f93a85" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_services_service" ADD CONSTRAINT "FK_068bb879d26fb9346383fa611bd" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointment_services_service" ADD CONSTRAINT "FK_6c22108412ee27973c0d93235b4" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment_services_service" DROP CONSTRAINT "FK_6c22108412ee27973c0d93235b4"`);
        await queryRunner.query(`ALTER TABLE "appointment_services_service" DROP CONSTRAINT "FK_068bb879d26fb9346383fa611bd"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_c048c6004b69354f46183f93a85"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c22108412ee27973c0d93235b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_068bb879d26fb9346383fa611b"`);
        await queryRunner.query(`DROP TABLE "appointment_services_service"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrationFromBackup1746919028357 implements MigrationInterface {
    name = 'InitialMigrationFromBackup1746919028357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('pending', 'confirmed', 'canceled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'pending', "scheduled_start" TIMESTAMP NOT NULL, "total_price" numeric(7,2) NOT NULL, "duration" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "eventId" character varying(255), "userId" integer, "customerId" integer, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "treatment" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" numeric(6,2) NOT NULL, "duration" integer NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_30dffe299fe6ba8c1718fa93d81" UNIQUE ("name"), CONSTRAINT "PK_5ed256f72665dee35f8e47b416e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "roleId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "google_token" ("id" SERIAL NOT NULL, "accountId" character varying(100) NOT NULL, "refreshToken" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1da1f7a9bbe530f40146d34ac40" PRIMARY KEY ("id", "accountId"))`);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" SERIAL NOT NULL, "day" character varying NOT NULL, "open_hours" text array NOT NULL, CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_day" ON "schedule" ("day") `);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "price" numeric(7,2) NOT NULL, "stock" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_profile" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "contactDetails" json NOT NULL, "socialLinks" json NOT NULL, CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_treatments_treatment" ("appointmentId" integer NOT NULL, "treatmentId" integer NOT NULL, CONSTRAINT "PK_5d3c4ff1dd8ec06bb4a8de72f56" PRIMARY KEY ("appointmentId", "treatmentId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4ef1431424080e308f133d0ec0" ON "appointment_treatments_treatment" ("appointmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f6e2a9725177d287fb7c9213a" ON "appointment_treatments_treatment" ("treatmentId") `);
        await queryRunner.query(`CREATE TABLE "appointment_products_product" ("appointmentId" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_58517f94d991cf7c5846068754d" PRIMARY KEY ("appointmentId", "productId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b0e4cbd9b04b48604546c2e6da" ON "appointment_products_product" ("appointmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_599105eb5a0e252c015fdf8e77" ON "appointment_products_product" ("productId") `);
        await queryRunner.query(`CREATE TABLE "product_appointments_appointment" ("productId" integer NOT NULL, "appointmentId" integer NOT NULL, CONSTRAINT "PK_c91657e26c025d9b151bb4c2998" PRIMARY KEY ("productId", "appointmentId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_810a20d9f58b7c6173b1708090" ON "product_appointments_appointment" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_55358ffc8b9f5cb4a713ba15a2" ON "product_appointments_appointment" ("appointmentId") `);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_c048c6004b69354f46183f93a85" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_treatments_treatment" ADD CONSTRAINT "FK_4ef1431424080e308f133d0ec04" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointment_treatments_treatment" ADD CONSTRAINT "FK_2f6e2a9725177d287fb7c9213a0" FOREIGN KEY ("treatmentId") REFERENCES "treatment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_products_product" ADD CONSTRAINT "FK_b0e4cbd9b04b48604546c2e6da4" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointment_products_product" ADD CONSTRAINT "FK_599105eb5a0e252c015fdf8e77f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_appointments_appointment" ADD CONSTRAINT "FK_810a20d9f58b7c6173b17080909" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_appointments_appointment" ADD CONSTRAINT "FK_55358ffc8b9f5cb4a713ba15a2b" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_appointments_appointment" DROP CONSTRAINT "FK_55358ffc8b9f5cb4a713ba15a2b"`);
        await queryRunner.query(`ALTER TABLE "product_appointments_appointment" DROP CONSTRAINT "FK_810a20d9f58b7c6173b17080909"`);
        await queryRunner.query(`ALTER TABLE "appointment_products_product" DROP CONSTRAINT "FK_599105eb5a0e252c015fdf8e77f"`);
        await queryRunner.query(`ALTER TABLE "appointment_products_product" DROP CONSTRAINT "FK_b0e4cbd9b04b48604546c2e6da4"`);
        await queryRunner.query(`ALTER TABLE "appointment_treatments_treatment" DROP CONSTRAINT "FK_2f6e2a9725177d287fb7c9213a0"`);
        await queryRunner.query(`ALTER TABLE "appointment_treatments_treatment" DROP CONSTRAINT "FK_4ef1431424080e308f133d0ec04"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_c048c6004b69354f46183f93a85"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55358ffc8b9f5cb4a713ba15a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_810a20d9f58b7c6173b1708090"`);
        await queryRunner.query(`DROP TABLE "product_appointments_appointment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_599105eb5a0e252c015fdf8e77"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0e4cbd9b04b48604546c2e6da"`);
        await queryRunner.query(`DROP TABLE "appointment_products_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f6e2a9725177d287fb7c9213a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ef1431424080e308f133d0ec0"`);
        await queryRunner.query(`DROP TABLE "appointment_treatments_treatment"`);
        await queryRunner.query(`DROP TABLE "user_profile"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP INDEX "public"."unique_day"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TABLE "google_token"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "treatment"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
    }

}

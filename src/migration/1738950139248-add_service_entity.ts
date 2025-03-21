import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceEntity1738950139248 implements MigrationInterface {
  name = 'AddServiceEntity1738950139248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL, "duration" integer NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "service"`);
  }
}

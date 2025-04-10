import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeScheduledStartToTimestamptz1744154904187 implements MigrationInterface {
    name = 'ChangeScheduledStartToTimestamptz1744154904187';
  
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "appointment"
        ALTER COLUMN "scheduled_start"
        TYPE TIMESTAMPTZ
        USING "scheduled_start" AT TIME ZONE 'UTC';
      `);
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "appointment"
        ALTER COLUMN "scheduled_start"
        TYPE TIMESTAMP
        USING "scheduled_start" AT TIME ZONE 'America/Mexico_City';
      `);
    }
  }

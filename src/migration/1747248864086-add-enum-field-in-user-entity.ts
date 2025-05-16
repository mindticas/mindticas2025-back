import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnumFieldInUserEntity1747248864086 implements MigrationInterface {
    name = 'AddEnumFieldInUserEntity1747248864086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_enum" AS ENUM('Admin', 'Employee')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role_enum" "public"."user_role_enum_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_enum"`);
    }

}

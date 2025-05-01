import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1707275191127 implements MigrationInterface {
    name = 'Init1707275191127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "phrases" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "content" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                "user_id" integer NOT NULL,
                CONSTRAINT "UQ_fef984da1ebae0cfbea179a87f9" UNIQUE ("content")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "uid" integer NOT NULL,
                "name" varchar NOT NULL,
                "role" varchar NOT NULL DEFAULT ('new'),
                "first_name" varchar NOT NULL,
                "last_name" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_6e20ce1edf0678a09f1963f9587" UNIQUE ("uid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_phrases" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "content" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                "user_id" integer NOT NULL,
                CONSTRAINT "UQ_fef984da1ebae0cfbea179a87f9" UNIQUE ("content"),
                CONSTRAINT "FK_87e9aca68c9ef4fafb5ca859afe" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_phrases"(
                    "id",
                    "content",
                    "created_at",
                    "updated_at",
                    "user_id"
                )
            SELECT "id",
                "content",
                "created_at",
                "updated_at",
                "user_id"
            FROM "phrases"
        `);
        await queryRunner.query(`
            DROP TABLE "phrases"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_phrases"
                RENAME TO "phrases"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "phrases"
                RENAME TO "temporary_phrases"
        `);
        await queryRunner.query(`
            CREATE TABLE "phrases" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "content" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                "user_id" integer NOT NULL,
                CONSTRAINT "UQ_fef984da1ebae0cfbea179a87f9" UNIQUE ("content")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "phrases"(
                    "id",
                    "content",
                    "created_at",
                    "updated_at",
                    "user_id"
                )
            SELECT "id",
                "content",
                "created_at",
                "updated_at",
                "user_id"
            FROM "temporary_phrases"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_phrases"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "phrases"
        `);
    }

}

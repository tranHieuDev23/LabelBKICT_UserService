import { Knex } from "knex";

const TabNameUserServiceTokenPublicKey = "user_service_token_public_key_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameUserServiceTokenPublicKey))) {
        await knex.schema.createTable(TabNameUserServiceTokenPublicKey, (tab) => {
            tab.increments("public_key_id", { primaryKey: true });
            tab.text("data").notNullable();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameUserServiceTokenPublicKey);
}

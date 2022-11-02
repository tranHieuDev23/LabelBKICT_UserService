import { Knex } from "knex";

const TabNameUserServiceUser = "user_service_user_tab";
const TabNameUserServiceUserTag = "user_service_user_tag_tab";

const TabNameUserServiceUserHasUserTag = "user_service_user_has_user_tag_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameUserServiceUserTag))) {
        await knex.schema.createTable(TabNameUserServiceUserTag, (tab) => {
            tab.increments("user_tag_id", { primaryKey: true });
            tab.string("display_name", 256).notNullable();
            tab.string("description", 256).notNullable();

            tab.index(
                ["display_name"],
                "user_service_user_tag_display_name_idx"
            );
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserHasUserTag))) {
        await knex.schema.createTable(
            TabNameUserServiceUserHasUserTag,
            (tab) => {
                tab.integer("user_id").notNullable();
                tab.integer("user_tag_id").notNullable();

                tab.foreign("user_id")
                    .references("user_id")
                    .inTable(TabNameUserServiceUser);
                tab.foreign("user_tag_id")
                    .references("user_tag_id")
                    .inTable(TabNameUserServiceUserTag)
                    .onDelete("CASCADE");

                tab.unique(["user_id", "user_tag_id"]);
                tab.index(["user_id"], "user_service_user_has_user_tag_idx");
            }
        );
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameUserServiceUserTag);
    await knex.schema.dropTableIfExists(TabNameUserServiceUserHasUserTag);
}

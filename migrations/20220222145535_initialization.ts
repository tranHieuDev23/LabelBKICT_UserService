import { Knex } from "knex";

const TabNameUserServiceUser = "user_service_user_tab";
const TabNameUserServiceUserPassword = "user_service_user_password_tab";
const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const TabNameUserServiceUserRole = "user_service_user_role_tab";
const TabNameUserServiceUserHasUserRole = "user_service_user_has_user_role_tab";
const TabNameUserServiceUserPermission = "user_service_user_permission_tab";
const TabNameUserServiceUserRoleHasUserPermission =
    "user_service_user_role_has_user_permission_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameUserServiceUser))) {
        await knex.schema.createTable(TabNameUserServiceUser, (tab) => {
            tab.increments("id", { primaryKey: true });
            tab.string("username", 64).notNullable().unique();
            tab.string("display_name", 256).notNullable();

            tab.index(["username"], "user_service_user_username_idx");
            tab.index(["display_name"], "user_service_user_display_name_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserPassword))) {
        await knex.schema.createTable(TabNameUserServiceUserPassword, (tab) => {
            tab.integer("of_user_id").notNullable();
            tab.string("hash", 128).notNullable();

            tab.primary(["of_user_id"]);
            tab.foreign("of_user_id")
                .references("id")
                .inTable(TabNameUserServiceUser);
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceBlacklistedToken))) {
        await knex.schema.createTable(
            TabNameUserServiceBlacklistedToken,
            (tab) => {
                tab.bigInteger("id").notNullable();
                tab.bigInteger("expire_at").notNullable();

                tab.primary(["id"]);
                tab.index(
                    ["expire_at"],
                    "user_service_blacklisted_token_expire_idx"
                );
            }
        );
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserRole))) {
        await knex.schema.createTable(TabNameUserServiceUserRole, (tab) => {
            tab.increments("id", { primaryKey: true });
            tab.string("display_name", 256).notNullable();
            tab.string("description", 256).notNullable();

            tab.index(
                ["display_name"],
                "user_service_user_role_display_name_idx"
            );
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserHasUserRole))) {
        await knex.schema.createTable(
            TabNameUserServiceUserHasUserRole,
            (tab) => {
                tab.integer("user_id").notNullable();
                tab.integer("user_role_id").notNullable();

                tab.foreign("user_id")
                    .references("id")
                    .inTable(TabNameUserServiceUser);
                tab.foreign("user_role_id")
                    .references("id")
                    .inTable(TabNameUserServiceUserRole)
                    .onDelete("CASCADE");

                tab.unique(["user_id", "user_role_id"]);
                tab.index(["user_id"], "user_service_user_has_user_role_idx");
            }
        );
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserPermission))) {
        await knex.schema.createTable(
            TabNameUserServiceUserPermission,
            (tab) => {
                tab.increments("id", { primaryKey: true });
                tab.string("permission_name", 256).notNullable().unique();
                tab.string("description", 256).notNullable();
            }
        );
    }

    if (
        !(await knex.schema.hasTable(
            TabNameUserServiceUserRoleHasUserPermission
        ))
    ) {
        await knex.schema.createTable(
            TabNameUserServiceUserRoleHasUserPermission,
            (tab) => {
                tab.integer("user_role_id").notNullable();
                tab.integer("user_permission_id").notNullable();

                tab.foreign("user_role_id")
                    .references("id")
                    .inTable(TabNameUserServiceUserRole)
                    .onDelete("CASCADE");
                tab.foreign("user_permission_id")
                    .references("id")
                    .inTable(TabNameUserServiceUserPermission)
                    .onDelete("CASCADE");

                tab.unique(["user_role_id", "user_permission_id"]);
                tab.index(
                    ["user_role_id"],
                    "user_service_user_role_has_user_permission_idx"
                );
            }
        );
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(
        TabNameUserServiceUserRoleHasUserPermission
    );
    await knex.schema.dropTableIfExists(TabNameUserServiceUserPermission);
    await knex.schema.dropTableIfExists(TabNameUserServiceUserHasUserRole);
    await knex.schema.dropTableIfExists(TabNameUserServiceUserRole);
    await knex.schema.dropTableIfExists(TabNameUserServiceBlacklistedToken);
    await knex.schema.dropTableIfExists(TabNameUserServiceUserPassword);
    await knex.schema.dropTableIfExists(TabNameUserServiceUser);
}

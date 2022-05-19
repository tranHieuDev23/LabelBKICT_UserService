import { Knex } from "knex";

const TabNameUserServiceUser = "user_service_user_tab";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        ALTER TABLE public.${TabNameUserServiceUser} ADD "full_text_search_document" tsvector;

        UPDATE public.${TabNameUserServiceUser} SET full_text_search_document = to_tsvector(username || ' ' || display_name);

        CREATE FUNCTION user_tab_write_trigger_function()
        RETURNS trigger AS $$
        BEGIN
            NEW."full_text_search_document" := to_tsvector(NEW."username" || ' ' || NEW."display_name");
            RETURN NEW;
        END $$ LANGUAGE 'plpgsql';

        CREATE TRIGGER user_tab_write_trigger
            BEFORE INSERT ON public.${TabNameUserServiceUser}
            FOR EACH ROW
            EXECUTE PROCEDURE user_tab_write_trigger_function();

        CREATE TRIGGER user_tab_update_trigger
            BEFORE UPDATE ON public.${TabNameUserServiceUser}
            FOR EACH ROW
            EXECUTE PROCEDURE user_tab_write_trigger_function();

        CREATE INDEX user_service_user_full_text_search_idx ON public.${TabNameUserServiceUser} USING gin(full_text_search_document);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(TabNameUserServiceUser, (tab) => {
        tab.dropColumn("full_text_search_document");
    });
    await knex.schema.raw(`
        DROP FUNCTION user_tab_write_trigger_function() CASCADE;
    `);
}

import { injected, token } from "brandi";
import knex, { Knex } from "knex";
import { UserServiceConfig, USER_SERVICE_CONFIG_TOKEN } from "../../config";

export function newKnexInstance(userServiceConfig: UserServiceConfig): Knex {
    return knex({
        client: "pg",
        connection: {
            host: userServiceConfig.databaseConfig.host,
            port: userServiceConfig.databaseConfig.port,
            user: userServiceConfig.databaseConfig.user,
            password: userServiceConfig.databaseConfig.password,
            database: userServiceConfig.databaseConfig.database,
        },
    });
}

injected(newKnexInstance, USER_SERVICE_CONFIG_TOKEN);

export const KNEX_INSTANCE_TOKEN = token<Knex>("Knex");

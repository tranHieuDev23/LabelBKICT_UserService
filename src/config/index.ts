import { Container } from "brandi";
import { UserServiceConfig, USER_SERVICE_CONFIG_TOKEN } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { GRPC_SERVER_CONFIG } from "./grpc_service";
import { LOG_CONFIG_TOKEN } from "./log";
import { TOKEN_CONFIG_TOKEN } from "./token";

export * from "./log";
export * from "./distributed";
export * from "./database";
export * from "./grpc_service";
export * from "./token";
export * from "./config";

export function bindToContainer(container: Container): void {
    container
        .bind(USER_SERVICE_CONFIG_TOKEN)
        .toInstance(UserServiceConfig.fromEnv)
        .inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => container.get(USER_SERVICE_CONFIG_TOKEN).logConfig)
        .inSingletonScope();
    container
        .bind(DISTRIBUTED_CONFIG_TOKEN)
        .toInstance(
            () => container.get(USER_SERVICE_CONFIG_TOKEN).distributedConfig
        )
        .inSingletonScope();
    container
        .bind(DATABASE_CONFIG_TOKEN)
        .toInstance(
            () => container.get(USER_SERVICE_CONFIG_TOKEN).databaseConfig
        )
        .inSingletonScope();
    container
        .bind(GRPC_SERVER_CONFIG)
        .toInstance(
            () => container.get(USER_SERVICE_CONFIG_TOKEN).grpcServerConfig
        )
        .inSingletonScope();
    container
        .bind(TOKEN_CONFIG_TOKEN)
        .toInstance(() => container.get(USER_SERVICE_CONFIG_TOKEN).tokenConfig)
        .inSingletonScope();
}

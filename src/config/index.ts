import { Container } from "brandi";
import { UserServiceConfig, USER_SERVICE_CONFIG_TOKEN } from "./config";

export * from "./grpc_service";
export * from "./config";

export function bindToContainer(container: Container): void {
    container
        .bind(USER_SERVICE_CONFIG_TOKEN)
        .toInstance(UserServiceConfig.fromEnv)
        .inSingletonScope();
}

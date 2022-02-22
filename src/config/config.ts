import { token } from "brandi";
import { GRPCServerConfig } from "./grpc_service";

export class UserServiceConfig {
    public grpcServerConfig = new GRPCServerConfig();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN =
    token<UserServiceConfig>("UserServiceConfig");

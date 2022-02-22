import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_service";

export class UserServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN =
    token<UserServiceConfig>("UserServiceConfig");

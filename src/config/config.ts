import { token } from "brandi";
import { ApplicationConfig } from "./application";
import { DatabaseConfig } from "./database";
import { DistributedConfig } from "./distributed";
import { GRPCServerConfig } from "./grpc_service";
import { LogConfig } from "./log";
import { TokenConfig } from "./token";

export class UserServiceConfig {
    public logConfig = new LogConfig();
    public distributedConfig = new DistributedConfig();
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public tokenConfig = new TokenConfig();
    public applicationConfig = new ApplicationConfig();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.logConfig = LogConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.tokenConfig = TokenConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN =
    token<UserServiceConfig>("UserServiceConfig");

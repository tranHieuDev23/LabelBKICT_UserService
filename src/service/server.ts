import {
    loadPackageDefinition,
    Server,
    ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import {
    UserServiceHandlersFactory,
    USER_SERVICE_HANDLERS_FACTORY_TOKEN,
} from "./handler";
import { UserServiceConfig, USER_SERVICE_CONFIG_TOKEN } from "../config";
import { ProtoGrpcType } from "../proto/gen/user_service";

export class UserServiceGRPCServer {
    constructor(
        private readonly handlerFactory: UserServiceHandlersFactory,
        private readonly userServiceConfig: UserServiceConfig
    ) {}

    public loadProtoAndStart(protoPath: string): void {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(
            userServiceProtoGrpc.UserService.service,
            this.handlerFactory.getUserServiceHandlers()
        );

        server.bindAsync(
            `127.0.0.1:${this.userServiceConfig.grpcServerConfig.port}`,
            ServerCredentials.createInsecure(),
            (error) => {
                if (error) {
                    console.error(error);
                    return;
                }
                server.start();
            }
        );
    }

    private loadUserServiceProtoGrpc(protoPath: string): ProtoGrpcType {
        const packageDefinition = loadSync(protoPath, {
            keepCase: true,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        const userServicePackageDefinition = loadPackageDefinition(
            packageDefinition
        ) as unknown;
        return userServicePackageDefinition as ProtoGrpcType;
    }
}

injected(
    UserServiceGRPCServer,
    USER_SERVICE_HANDLERS_FACTORY_TOKEN,
    USER_SERVICE_CONFIG_TOKEN
);

export const USER_SERVICE_GRPC_SERVER_TOKEN = token<UserServiceGRPCServer>(
    "UserServiceGRPCServer"
);

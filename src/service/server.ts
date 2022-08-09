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
import { GRPCServerConfig, GRPC_SERVER_CONFIG } from "../config";
import { ProtoGrpcType } from "../proto/gen/user_service";
import { Logger } from "winston";
import { LOGGER_TOKEN } from "../utils";

export class UserServiceGRPCServer {
    constructor(
        private readonly handlerFactory: UserServiceHandlersFactory,
        private readonly grpcServerConfig: GRPCServerConfig,
        private readonly logger: Logger
    ) {}

    public loadProtoAndStart(protoPath: string): void {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(
            userServiceProtoGrpc.UserService.service,
            this.handlerFactory.getUserServiceHandlers()
        );

        server.bindAsync(
            `0.0.0.0:${this.grpcServerConfig.port}`,
            ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    this.logger.error("failed to start grpc server", { error });
                    return;
                }

                console.log(`starting grpc server, listening to port ${port}`);
                this.logger.info("starting grpc server", { port });
                server.start();
            }
        );
    }

    private loadUserServiceProtoGrpc(protoPath: string): ProtoGrpcType {
        const packageDefinition = loadSync(protoPath, {
            keepCase: false,
            enums: Number,
            defaults: false,
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
    GRPC_SERVER_CONFIG,
    LOGGER_TOKEN
);

export const USER_SERVICE_GRPC_SERVER_TOKEN = token<UserServiceGRPCServer>(
    "UserServiceGRPCServer"
);

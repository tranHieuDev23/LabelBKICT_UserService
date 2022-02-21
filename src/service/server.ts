import {
    loadPackageDefinition,
    Server,
    ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { GRPCServerConfig } from "../config";
import { ProtoGrpcType } from "../proto/gen/user_service";
import { UserServiceHandlersFactory } from "./handler";

export class UserServiceGRPCServer {
    constructor(
        private readonly handlerFactory: UserServiceHandlersFactory,
        private readonly grpcServerConfig: GRPCServerConfig
    ) {}

    public loadProtoAndStart(protoPath: string): void {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(
            userServiceProtoGrpc.UserService.service,
            this.handlerFactory.getUserServiceHandlers()
        );

        server.bind(
            `127.0.0.1:${this.grpcServerConfig.port}`,
            ServerCredentials.createInsecure()
        );
        server.start();
        process.once("SIGINT", server.tryShutdown);
        process.once("SIGTERM", server.tryShutdown);
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

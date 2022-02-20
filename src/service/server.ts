import {
    loadPackageDefinition,
    Server,
    ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ProtoGrpcType } from "../proto/gen/user_service";
import { UserServiceHandlersFactory } from "./handler";

export class UserServiceGRPCServer {
    constructor(
        private readonly protoPath: string,
        private readonly handlerFactory: UserServiceHandlersFactory
    ) {}

    public start(port: number): void {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc();

        const server = new Server();
        server.addService(
            userServiceProtoGrpc.UserService.service,
            this.handlerFactory.getUserServiceHandlers()
        );

        server.bind(`127.0.0.1:${port}`, ServerCredentials.createInsecure());
        server.start();
        process.once("SIGINT", server.tryShutdown);
        process.once("SIGTERM", server.tryShutdown);
    }

    private loadUserServiceProtoGrpc(): ProtoGrpcType {
        const packageDefinition = loadSync(this.protoPath, {
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

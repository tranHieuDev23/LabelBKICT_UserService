import {
    loadPackageDefinition,
    Server,
    ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { UserServiceHandlers } from "../proto/gen/UserService";
import { ProtoGrpcType } from "../proto/gen/user_service";

export class UserServiceGRPCServer {
    constructor(
        private readonly protoPath: string,
        private readonly handler: UserServiceHandlers
    ) {}

    public start(port: number): void {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc();

        const server = new Server();
        server.addService(
            userServiceProtoGrpc.UserService.service,
            this.handler
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

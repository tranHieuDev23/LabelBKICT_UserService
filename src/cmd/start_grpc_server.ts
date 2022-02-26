import { Container } from "brandi";
import dotenv from "dotenv";
import * as utils from "../utils";
import * as config from "../config";
import * as db from "../dataaccess/db";
import * as password from "../module/password";
import * as permission from "../module/permission";
import * as role from "../module/role";
import * as token from "../module/token";
import * as user from "../module/user";
import * as service from "../service";

export function startGRPCServer(dotenvPath: string) {
    dotenv.config({
        path: dotenvPath,
    });

    const container = new Container();
    utils.bindToContainer(container);
    config.bindToContainer(container);
    db.bindToContainer(container);
    password.bindToContainer(container);
    permission.bindToContainer(container);
    role.bindToContainer(container);
    token.bindToContainer(container);
    user.bindToContainer(container);
    service.bindToContainer(container);

    const server = container.get(service.USER_SERVICE_GRPC_SERVER_TOKEN);
    server.loadProtoAndStart("./src/proto/service/user_service.proto");
}

import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";
import { initialize } from "./cmd/initialize";

const args = minimist(process.argv);
if (args["start_grpc_server"]) {
    startGRPCServer(".env");
} else if (args["initialize"]) {
    initialize(".env");
} else {
    console.log("no component was selected, exiting...");
}

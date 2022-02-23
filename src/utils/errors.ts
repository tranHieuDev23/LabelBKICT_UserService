import { status } from "@grpc/grpc-js";

export class ErrorWithStatus {
    constructor(public readonly error: Error, public readonly status: status) {}
}

import { Container } from "brandi";
import {
    DeleteExpiredBlacklistedTokenJobImpl,
    DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN,
} from "./delete_expired_blacklisted_token";
import {
    InitializationJobImpl,
    INITIALIZATION_JOB_TOKEN,
} from "./initialization";

export * from "./initialization";
export * from "./delete_expired_blacklisted_token";

export function bindToContainer(container: Container): void {
    container
        .bind(INITIALIZATION_JOB_TOKEN)
        .toInstance(InitializationJobImpl)
        .inSingletonScope();
    container
        .bind(DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN)
        .toInstance(DeleteExpiredBlacklistedTokenJobImpl)
        .inSingletonScope();
}

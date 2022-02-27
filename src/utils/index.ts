import { Container } from "brandi";
import { ID_GENERATOR_TOKEN, SnowflakeIDGenerator } from "./id";
import { initializeLogger, LOGGER_TOKEN } from "./logging";

export * from "./errors";
export * from "./logging";
export * from "./id";

export function bindToContainer(container: Container): void {
    container
        .bind(LOGGER_TOKEN)
        .toInstance(initializeLogger)
        .inSingletonScope();
    container
        .bind(ID_GENERATOR_TOKEN)
        .toInstance(SnowflakeIDGenerator)
        .inSingletonScope();
}

import { Container } from "brandi";
import { Id_GENERATOR_TOKEN, SnowflakeIdGenerator } from "./id";
import { initializeLogger, LOGGER_TOKEN } from "./logging";
import { TimeImpl, TIMER_TOKEN } from "./time";

export * from "./errors";
export * from "./logging";
export * from "./id";
export * from "./time";

export function bindToContainer(container: Container): void {
    container
        .bind(LOGGER_TOKEN)
        .toInstance(initializeLogger)
        .inSingletonScope();
    container
        .bind(Id_GENERATOR_TOKEN)
        .toInstance(SnowflakeIdGenerator)
        .inSingletonScope();
    container.bind(TIMER_TOKEN).toInstance(TimeImpl).inSingletonScope();
}

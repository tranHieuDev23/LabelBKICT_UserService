import { Container } from "brandi";
import { initializeLogger, LOGGER_TOKEN } from "./logging";

export * from "./errors";
export * from "./logging";

export function bindToContainer(container: Container): void {
    container
        .bind(LOGGER_TOKEN)
        .toInstance(initializeLogger)
        .inSingletonScope();
}

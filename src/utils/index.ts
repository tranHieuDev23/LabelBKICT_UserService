import { Container } from "brandi";
import { Logger } from "winston";
import { LOGGER_TOKEN } from "./logging";

export * from "./errors";
export * from "./logging";

export function bindToContainer(container: Container): void {
    // container.bind<Logger>(LOGGER_TOKEN).
}

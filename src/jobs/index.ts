import { Container } from "brandi";
import {
    InitializationJobImpl,
    INITIALIZATION_JOB_TOKEN,
} from "./initialization";

export * from "./initialization";

export function bindToContainer(container: Container): void {
    container
        .bind(INITIALIZATION_JOB_TOKEN)
        .toInstance(InitializationJobImpl)
        .inSingletonScope();
}

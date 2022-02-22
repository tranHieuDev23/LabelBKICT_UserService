import { Container } from "brandi";
import {
    TOKEN_MANAGEMENT_OPERATOR_TOKEN,
    TokenManagementOperatorImpl,
} from "./token_management_operator";

export * from "./token_management_operator";

export function bindToContainer(container: Container): void {
    container
        .bind(TOKEN_MANAGEMENT_OPERATOR_TOKEN)
        .toInstance(TokenManagementOperatorImpl)
        .inSingletonScope();
}

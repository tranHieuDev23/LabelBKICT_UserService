import { Container } from "brandi";
import { JWTGenerator, TOKEN_GENERATOR_TOKEN } from "./generator";
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
    container
        .bind(TOKEN_GENERATOR_TOKEN)
        .toInstance(JWTGenerator)
        .inSingletonScope();
}

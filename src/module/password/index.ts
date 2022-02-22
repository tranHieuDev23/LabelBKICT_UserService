import { Container } from "brandi";
import {
    USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN,
    UserPasswordManagementOperatorImpl,
} from "./user_password_management_operator";

export * from "./user_password_management_operator";

export function bindToContainer(container: Container): void {
    container
        .bind(USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN)
        .toInstance(UserPasswordManagementOperatorImpl)
        .inSingletonScope();
}

import { Container } from "brandi";
import {
    BlacklistedTokenDataAccessorImpl,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
} from "./blacklisted_token";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import { UserDataAccessorImpl, USER_DATA_ACCESSOR_TOKEN } from "./user";
import {
    UserHasUserRoleDataAccessorImpl,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
} from "./user_has_user_role";
import {
    UserPasswordDataAccessorImpl,
    USER_PASSWORD_DATA_ACCESSOR_TOKEN,
} from "./user_password";
import {
    UserPermissionDataAccessorImpl,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
} from "./user_permission";
import {
    UserRoleDataAccessorImpl,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
} from "./user_role";
import {
    UserRoleHasUserPermissionDataAccessorImpl,
    USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN,
} from "./user_role_has_user_permission";
import {
    UserTagDataAccessorImpl,
    USER_TAG_DATA_ACCESSOR_TOKEN,
} from "./user_tag";
import {
    UserHasUserTagDataAccessorImpl,
    USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN,
} from "./user_has_user_tag";

export * from "./user";
export * from "./user_password";
export * from "./user_role";
export * from "./user_permission";
export * from "./user_has_user_role";
export * from "./user_role_has_user_permission";
export * from "./blacklisted_token";
export * from "./user_tag";
export * from "./user_has_user_tag";

export function bindToContainer(container: Container): void {
    container
        .bind(KNEX_INSTANCE_TOKEN)
        .toInstance(newKnexInstance)
        .inSingletonScope();
    container
        .bind(USER_DATA_ACCESSOR_TOKEN)
        .toInstance(UserDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_PASSWORD_DATA_ACCESSOR_TOKEN)
        .toInstance(UserPasswordDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_ROLE_DATA_ACCESSOR_TOKEN)
        .toInstance(UserRoleDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_PERMISSION_DATA_ACCESSOR_TOKEN)
        .toInstance(UserPermissionDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN)
        .toInstance(UserHasUserRoleDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN)
        .toInstance(UserRoleHasUserPermissionDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN)
        .toInstance(BlacklistedTokenDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_TAG_DATA_ACCESSOR_TOKEN)
        .toInstance(UserTagDataAccessorImpl)
        .inSingletonScope();
    container
        .bind(USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN)
        .toInstance(UserHasUserTagDataAccessorImpl)
        .inSingletonScope();
}

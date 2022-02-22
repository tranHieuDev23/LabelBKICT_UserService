import { injected, token } from "brandi";
import {
    UserDataAccessor,
    UserPasswordDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
    USER_PASSWORD_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";

export interface UserPasswordManagementOperator {
    createUserPassword(userID: number, password: string): Promise<void>;
    updateUserPassword(userID: number, password: string): Promise<void>;
    loginWithPassword(
        username: string,
        password: string
    ): Promise<{ user: User; token: string }>;
}

export class UserPasswordManagementOperatorImpl
    implements UserPasswordManagementOperator
{
    constructor(
        private readonly userPasswordDM: UserPasswordDataAccessor,
        private readonly userDM: UserDataAccessor
    ) {}

    public createUserPassword(ofUserID: number, hash: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public updateUserPassword(ofUserID: number, hash: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public loginWithPassword(
        username: string,
        password: string
    ): Promise<{ user: User; token: string }> {
        throw new Error("Method not implemented.");
    }
}

injected(
    UserPasswordManagementOperatorImpl,
    USER_PASSWORD_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN
);

export const USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN =
    token<UserPasswordManagementOperator>("UserPasswordManagementOperator");

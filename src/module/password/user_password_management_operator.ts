import {
    UserDataAccessor,
    UserPasswordDataAccessor,
    UserPasswordDataAccessorImpl,
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
    implements UserPasswordDataAccessorImpl
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

    public getUserPasswordHash(ofUserID: number): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

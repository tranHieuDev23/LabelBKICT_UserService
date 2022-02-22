import { injected, token } from "brandi";

export interface UserPasswordDataAccessor {
    createUserPassword(ofUserID: number, hash: string): Promise<void>;
    updateUserPassword(ofUserID: number, hash: string): Promise<void>;
    getUserPasswordHash(ofUserID: number): Promise<string>;
}

export class UserPasswordDataAccessorImpl implements UserPasswordDataAccessor {
    public async createUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async updateUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserPasswordHash(ofUserID: number): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

injected(UserPasswordDataAccessorImpl);

export const USER_PASSWORD_DATA_ACCESSOR_TOKEN =
    token<UserPasswordDataAccessor>("UserPasswordDataAccessor");

export interface UserPasswordDataAccessor {
    CreateUserPassword(ofUserID: number, hash: string): Promise<void>;
    UpdateUserPassword(ofUserID: number, hash: string): Promise<void>;
    GetUserPasswordHash(ofUserID: number): Promise<string>;
}

export class UserPasswordDataAccessorImpl implements UserPasswordDataAccessor {
    public async CreateUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async UpdateUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUserPasswordHash(ofUserID: number): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

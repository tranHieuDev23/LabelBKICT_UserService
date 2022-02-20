export class User {
    constructor(
        public userID: number,
        public username: string,
        public displayName: string
    ) {}
}

export enum UserListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    USERNAME_ASCENDING = 2,
    USERNAME_DESCENDING = 3,
    DISPLAY_NAME_ASCENDING = 4,
    DISPLAY_NAME_DESCENDING = 5,
}

export interface UserDataAccessor {
    CreateUser(username: string, displayName: string): Promise<number>;
    UpdateUser(user: User): Promise<void>;
    GetUser(userID: number): Promise<User>;
    GetUserCount(): Promise<number>;
    GetUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]>;
}

export class UserDataAccessorImpl implements UserDataAccessor {
    public async CreateUser(
        username: string,
        displayName: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async UpdateUser(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUser(userID: number): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async GetUserCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async GetUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
}

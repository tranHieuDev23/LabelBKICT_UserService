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
    createUser(username: string, displayName: string): Promise<number>;
    updateUser(user: User): Promise<void>;
    getUserByUserID(userID: number): Promise<User>;
    getUserByUsername(username: string): Promise<User>;
    getUserCount(): Promise<number>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]>;
}

export class UserDataAccessorImpl implements UserDataAccessor {
    public async createUser(
        username: string,
        displayName: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async updateUser(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserByUserID(userID: number): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async getUserByUsername(username: string): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async getUserCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
}

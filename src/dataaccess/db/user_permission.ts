export class UserPermission {
    constructor(
        public id: number,
        public permissionName: string,
        public description: string
    ) {}
}

export interface UserPermissionDataAccessor {
    CreateUserPermission(
        permissionName: string,
        description: string
    ): Promise<number>;
    UpdateUserPermission(userPermission: UserPermission): Promise<void>;
    DeleteUserPermission(id: number): Promise<void>;
    GetUserPermissionList(): Promise<UserPermission[]>;
}

export class UserPermissionDataAccessorImpl
    implements UserPermissionDataAccessor
{
    public async CreateUserPermission(
        permissionName: string,
        description: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async UpdateUserPermission(
        userPermission: UserPermission
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async DeleteUserPermission(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUserPermissionList(): Promise<UserPermission[]> {
        throw new Error("Method not implemented.");
    }
}

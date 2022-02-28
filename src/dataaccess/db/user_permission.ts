import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class UserPermission {
    constructor(
        public id: number,
        public permissionName: string,
        public description: string
    ) {}
}

export interface UserPermissionDataAccessor {
    createUserPermission(
        permissionName: string,
        description: string
    ): Promise<number>;
    updateUserPermission(userPermission: UserPermission): Promise<void>;
    deleteUserPermission(id: number): Promise<void>;
    getUserPermissionList(): Promise<UserPermission[]>;
    getUserPermission(id: number): Promise<UserPermission | null>;
    getUserPermissionWithXLock(id: number): Promise<UserPermission | null>;
    withTransaction<T>(
        execFunc: (dataAccessor: UserPermissionDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUserPermission = "user_service_user_permission_tab";
const ColNameUserServiceUserPermissionID = "id";
const ColNameUserServiceUserPermissionPermissionName = "permission_name";
const ColNameUserServiceUserPermissionDescription = "description";

export class UserPermissionDataAccessorImpl
    implements UserPermissionDataAccessor
{
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

    public async createUserPermission(
        permissionName: string,
        description: string
    ): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserPermissionPermissionName]:
                        permissionName,
                    [ColNameUserServiceUserPermissionDescription]: description,
                })
                .returning(ColNameUserServiceUserPermissionID)
                .into(TabNameUserServiceUserPermission);
            return +rows[0][ColNameUserServiceUserPermissionID];
        } catch (error) {
            this.logger.error(
                "failed to create user permission",
                { permissionName },
                { description },
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserPermission(
        userPermission: UserPermission
    ): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserPermission)
                .update({
                    [ColNameUserServiceUserPermissionPermissionName]:
                        userPermission.permissionName,
                    [ColNameUserServiceUserPermissionDescription]:
                        userPermission.description,
                })
                .where({
                    [ColNameUserServiceUserPermissionID]: userPermission.id,
                });
        } catch (error) {
            this.logger.error(
                "failed to update user permission",
                { userPermission },
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserPermission(id: number): Promise<void> {
        try {
            const deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserPermission)
                .where({
                    [ColNameUserServiceUserPermissionID]: id,
                });
            if (deletedCount === 0) {
                this.logger.error(
                    "no user permission with user_permission_id found",
                    { userPermissionID: id }
                );
                throw new ErrorWithStatus(
                    `no user permission with user_permission_id ${id} found`,
                    status.NOT_FOUND
                );
            }
        } catch (error) {
            this.logger.error(
                "failed to delete user permission",
                { userPermissionID: id },
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPermissionList(): Promise<UserPermission[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserPermission);
            return rows.map((row) => this.getUserPermissionFromRow(row));
        } catch (error) {
            this.logger.error("failed to get user permission list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPermission(id: number): Promise<UserPermission | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserPermission)
                .where({
                    [ColNameUserServiceUserPermissionID]: id,
                });

            if (rows.length == 0) {
                this.logger.debug(
                    "no user role with user_permission_id found",
                    { userPermissionID: id }
                );
                return null;
            }

            if (rows.length > 1) {
                this.logger.error(
                    "more than one user with user_permission_id found",
                    { userPermissionID: id }
                );
                throw new ErrorWithStatus(
                    "more than one user role was found",
                    status.INTERNAL
                );
            }

            return this.getUserPermissionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get user permission list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPermissionWithXLock(
        id: number
    ): Promise<UserPermission | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserPermission)
                .where({
                    [ColNameUserServiceUserPermissionID]: id,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug(
                    "no user role with user_permission_id found",
                    { userPermissionID: id }
                );
                return null;
            }

            if (rows.length > 1) {
                this.logger.error(
                    "more than one user with user_permission_id found",
                    { userPermissionID: id }
                );
                throw new ErrorWithStatus(
                    "more than one user role was found",
                    status.INTERNAL
                );
            }

            return this.getUserPermissionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get user permission list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserPermissionDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserPermissionDataAccessorImpl(
                tx,
                this.logger
            );
            return cb(txDataAccessor);
        });
    }

    private getUserPermissionFromRow(row: Record<string, any>): UserPermission {
        return new UserPermission(
            +row[ColNameUserServiceUserPermissionID],
            row[ColNameUserServiceUserPermissionPermissionName],
            row[ColNameUserServiceUserPermissionDescription]
        );
    }
}

injected(UserPermissionDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_PERMISSION_DATA_ACCESSOR_TOKEN =
    token<UserPermissionDataAccessor>("UserPermissionDataAccessor");

import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { UserPermission } from "./user_permission";

export interface UserRoleHasUserPermissionDataAccessor {
    createUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    deleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]>;
    getUserRoleHasUserPermissionWithXLock(
        userRoleID: number,
        userPermissionID: number
    ): Promise<{ userRoleID: number; userPermissionID: number } | null>;
    withTransaction<T>(
        execFunc: (
            dataAccessor: UserRoleHasUserPermissionDataAccessor
        ) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUserRoleHasUserPermission =
    "user_service_user_role_has_user_permission_tab";
const ColNameUserServiceUserRoleHasUserPermissionUserRoleID = "user_role_id";
const ColNameUserServiceUserRoleHasUserPermissionUserPermissionID =
    "user_permission_id";

const TabNameUserServiceUserPermission = "user_service_user_permission_tab";
const ColNameUserServiceUserPermissionID = "id";
const ColNameUserServiceUserPermissionPermissionName = "permission_name";
const ColNameUserServiceUserPermissionDescription = "description";

export class UserRoleHasUserPermissionDataAccessorImpl
    implements UserRoleHasUserPermissionDataAccessor
{
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

    public async createUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleID]:
                        userRoleID,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionID]:
                        userPermissionID,
                })
                .into(TabNameUserServiceUserRoleHasUserPermission);
        } catch (error) {
            this.logger.error(
                "failed to create user role has user permission relation",
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        try {
            const deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .where({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleID]:
                        userRoleID,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionID]:
                        userPermissionID,
                });

            if (deletedCount === 0) {
                this.logger.debug(
                    "no user role has user permission relation found",
                    { userRoleID },
                    { userPermissionID }
                );
                throw new ErrorWithStatus(
                    `no user role has user permission relation found with user_role_id ${userRoleID}, user_permission_id ${userPermissionID}`,
                    status.NOT_FOUND
                );
            }
        } catch (error) {
            this.logger.error(
                "failed to create user role has user permission relation",
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .join(
                    TabNameUserServiceUserPermission,
                    ColNameUserServiceUserRoleHasUserPermissionUserPermissionID,
                    ColNameUserServiceUserPermissionID
                )
                .whereIn(
                    ColNameUserServiceUserRoleHasUserPermissionUserRoleID,
                    userRoleIDList
                )
                .orderBy(
                    ColNameUserServiceUserRoleHasUserPermissionUserRoleID,
                    "asc"
                );

            const userRoleIDToUserPermissionList = new Map<
                number,
                UserPermission[]
            >();
            for (const row of rows) {
                const userRoleID =
                    row[ColNameUserServiceUserRoleHasUserPermissionUserRoleID];
                if (!userRoleIDToUserPermissionList.has(userRoleID)) {
                    userRoleIDToUserPermissionList.set(userRoleID, []);
                }
                userRoleIDToUserPermissionList
                    .get(userRoleID)
                    ?.push(
                        new UserPermission(
                            +row[
                                ColNameUserServiceUserRoleHasUserPermissionUserRoleID
                            ],
                            row[ColNameUserServiceUserPermissionPermissionName],
                            row[ColNameUserServiceUserPermissionDescription]
                        )
                    );
            }

            const results: UserPermission[][] = [];
            for (const userRoleID of userRoleIDList) {
                results.push(
                    userRoleIDToUserPermissionList.get(userRoleID) || []
                );
            }

            return results;
        } catch (error) {
            this.logger.error(
                "failed to get user permission list of user role id list",
                { error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserRoleHasUserPermissionWithXLock(
        userRoleID: number,
        userPermissionID: number
    ): Promise<{ userRoleID: number; userPermissionID: number } | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .where({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleID]:
                        userRoleID,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionID]:
                        userPermissionID,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug(
                    "no user role has user permission relation found",
                    { userRoleID },
                    { userPermissionID }
                );
                return null;
            }

            if (rows.length > 1) {
                this.logger.error(
                    "more than one user role has user permission relation found",
                    { userRoleID },
                    { userPermissionID }
                );
                throw new ErrorWithStatus(
                    "more than one user role has user permission relation found",
                    status.INTERNAL
                );
            }

            return {
                userRoleID:
                    +rows[0][
                        ColNameUserServiceUserRoleHasUserPermissionUserRoleID
                    ],
                userPermissionID:
                    +rows[0][
                        ColNameUserServiceUserRoleHasUserPermissionUserPermissionID
                    ],
            };
        } catch (error) {
            this.logger.error("failed to get user role list of user id list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserRoleHasUserPermissionDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor =
                new UserRoleHasUserPermissionDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(
    UserRoleHasUserPermissionDataAccessorImpl,
    KNEX_INSTANCE_TOKEN,
    LOGGER_TOKEN
);

export const USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN =
    token<UserRoleHasUserPermissionDataAccessor>(
        "UserRoleHasUserPermissionDataAccessor"
    );

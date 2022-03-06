import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { UserRole } from "./user_role";

export interface UserHasUserRoleDataAccessor {
    createUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    deleteUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    getUserRoleListOfUserList(userIDList: number[]): Promise<UserRole[][]>;
    getUserRoleIDListOfUser(userID: number): Promise<number[]>;
    getUserHasUserRoleWithXLock(
        userID: number,
        userRoleID: number
    ): Promise<{ userID: number; userRoleID: number } | null>;
    withTransaction<T>(
        execFunc: (dataAccessor: UserHasUserRoleDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUserHasUserRole = "user_service_user_has_user_role_tab";
const ColNameUserServiceUserHasUserRoleUserID = "user_id";
const ColNameUserServiceUserHasUserRoleUserRoleID = "user_role_id";

const TabNameUserServiceUserRole = "user_service_user_role_tab";
const ColNameUserServiceUserRoleID = "id";
const ColNameUserServiceUserRoleDisplayName = "display_name";
const ColNameUserServiceUserRoleDescription = "description";

export class UserHasUserRoleDataAccessorImpl
    implements UserHasUserRoleDataAccessor
{
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

    public async createUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserHasUserRoleUserID]: userID,
                    [ColNameUserServiceUserHasUserRoleUserRoleID]: userRoleID,
                })
                .into(TabNameUserServiceUserHasUserRole);
        } catch (error) {
            this.logger.error("failed to create user has user role relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserID]: userID,
                    [ColNameUserServiceUserHasUserRoleUserRoleID]: userRoleID,
                });
        } catch (error) {
            this.logger.error("failed to create user has user role relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug(
                "no user has user role relation found",
                { userID },
                { userRoleID }
            );
            throw new ErrorWithStatus(
                `no user has user role relation found with user_id ${userID}, user_role_id ${userRoleID}`,
                status.NOT_FOUND
            );
        }
    }

    public async getUserRoleListOfUserList(
        userIDList: number[]
    ): Promise<UserRole[][]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .join(
                    TabNameUserServiceUserRole,
                    ColNameUserServiceUserHasUserRoleUserRoleID,
                    ColNameUserServiceUserRoleID
                )
                .whereIn(ColNameUserServiceUserHasUserRoleUserID, userIDList)
                .orderBy(ColNameUserServiceUserHasUserRoleUserID, "asc");

            const userIDToUserRoleList = new Map<number, UserRole[]>();
            for (const row of rows) {
                const userID = row[ColNameUserServiceUserHasUserRoleUserID];
                if (!userIDToUserRoleList.has(userID)) {
                    userIDToUserRoleList.set(userID, []);
                }
                userIDToUserRoleList
                    .get(userID)
                    ?.push(
                        new UserRole(
                            +row[ColNameUserServiceUserHasUserRoleUserRoleID],
                            row[ColNameUserServiceUserRoleDisplayName],
                            row[ColNameUserServiceUserRoleDescription]
                        )
                    );
            }

            const results: UserRole[][] = [];
            for (const userID of userIDList) {
                results.push(userIDToUserRoleList.get(userID) || []);
            }

            return results;
        } catch (error) {
            this.logger.error("failed to get user role list of user id list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserRoleIDListOfUser(userID: number): Promise<number[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserID]: userID,
                });

            return rows.map(
                (row) => +row[ColNameUserServiceUserHasUserRoleUserRoleID]
            );
        } catch (error) {
            this.logger.error("failed to get user role id list of user id", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserHasUserRoleWithXLock(
        userID: number,
        userRoleID: number
    ): Promise<{ userID: number; userRoleID: number } | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserID]: userID,
                    [ColNameUserServiceUserHasUserRoleUserRoleID]: userRoleID,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug(
                    "no user has user role relation found",
                    { userID },
                    { userRoleID }
                );
                return null;
            }

            if (rows.length > 1) {
                this.logger.error(
                    "more than one user has user role relation found",
                    { userID },
                    { userRoleID }
                );
                throw new ErrorWithStatus(
                    "more than one user has user role relation found",
                    status.INTERNAL
                );
            }

            return {
                userID: +rows[0][ColNameUserServiceUserHasUserRoleUserID],
                userRoleID:
                    +rows[0][ColNameUserServiceUserHasUserRoleUserRoleID],
            };
        } catch (error) {
            this.logger.error("failed to get user role list of user id list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserHasUserRoleDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserHasUserRoleDataAccessorImpl(
                tx,
                this.logger
            );
            return cb(txDataAccessor);
        });
    }
}

injected(UserHasUserRoleDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN =
    token<UserHasUserRoleDataAccessor>("UserHasUserRoleDataAccessor");

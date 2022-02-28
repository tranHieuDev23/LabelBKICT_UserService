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
}

const TabNameUserServiceUserHasUserRole = "user_service_user_has_user_role_tab";
const ColNameUserServiceUserHasUserRoleUserID = "user_id";
const ColNameUserServiceUserHasUserRoleUserRoleID = "user_role_id";

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
        try {
            const deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserID]: userID,
                    [ColNameUserServiceUserHasUserRoleUserRoleID]: userRoleID,
                });

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
        } catch (error) {
            this.logger.error("failed to create user has user role relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserRoleListOfUserList(
        userIDList: number[]
    ): Promise<UserRole[][]> {
        throw new Error("Method not implemented.");
    }
}

injected(UserHasUserRoleDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN =
    token<UserHasUserRoleDataAccessor>("UserHasUserRoleDataAccessor");

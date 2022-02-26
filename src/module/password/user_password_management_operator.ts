import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Logger } from "winston";
import validator from "validator";
import {
    UserDataAccessor,
    UserPasswordDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
    USER_PASSWORD_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { Hasher, HASHER_TOKEN } from "./hasher";

export interface UserPasswordManagementOperator {
    createUserPassword(userID: number, password: string): Promise<void>;
    updateUserPassword(userID: number, password: string): Promise<void>;
    loginWithPassword(
        username: string,
        password: string
    ): Promise<{ user: User; token: string }>;
}

export class UserPasswordManagementOperatorImpl
    implements UserPasswordManagementOperator
{
    constructor(
        private readonly userPasswordDM: UserPasswordDataAccessor,
        private readonly userDM: UserDataAccessor,
        private readonly hasher: Hasher,
        private readonly logger: Logger
    ) {}

    public async createUserPassword(
        ofUserID: number,
        password: string
    ): Promise<void> {
        if (!this.isValidPassword(password)) {
            this.logger.error("invalid password");
            throw new ErrorWithStatus(
                `invalid password`,
                status.INVALID_ARGUMENT
            );
        }

        const user = await this.userDM.getUserByUserID(ofUserID);
        if (user === null) {
            this.logger.error("no user with user_id found", {
                userID: ofUserID,
            });
            throw new ErrorWithStatus(
                `no user with with id ${ofUserID} found`,
                status.NOT_FOUND
            );
        }

        const hash = await this.hasher.hash(password);
        return this.userPasswordDM.withTransaction(async (dm) => {
            const oldHash = await dm.getUserPasswordHash(ofUserID);
            if (oldHash !== null) {
                this.logger.error("user with user_id already has a password", {
                    userID: ofUserID,
                });
                throw new ErrorWithStatus(
                    `user with id ${ofUserID} already has a password`,
                    status.ALREADY_EXISTS
                );
            }

            await dm.createUserPassword(ofUserID, hash);
        });
    }

    public async updateUserPassword(
        ofUserID: number,
        password: string
    ): Promise<void> {
        if (!this.isValidPassword(password)) {
            this.logger.error("invalid password");
            throw new ErrorWithStatus(
                `invalid password`,
                status.INVALID_ARGUMENT
            );
        }

        const user = await this.userDM.getUserByUserID(ofUserID);
        if (user === null) {
            this.logger.error("no user with user_id found", {
                userID: ofUserID,
            });
            throw new ErrorWithStatus(
                `no user with with id ${ofUserID} found`,
                status.NOT_FOUND
            );
        }

        const hash = await this.hasher.hash(password);
        return this.userPasswordDM.withTransaction(async (dm) => {
            const oldHash = await dm.getUserPasswordHash(ofUserID);
            if (oldHash === null) {
                this.logger.error(
                    "user with user_id does not have a password",
                    {
                        userID: ofUserID,
                    }
                );
                throw new ErrorWithStatus(
                    `user with id ${ofUserID} does not have a password`,
                    status.NOT_FOUND
                );
            }

            await dm.updateUserPassword(ofUserID, hash);
        });
    }

    public async loginWithPassword(
        username: string,
        password: string
    ): Promise<{ user: User; token: string }> {
        throw new Error("Method not implemented.");
    }

    private isValidPassword(password: string): boolean {
        return validator.isLength(password, { min: 8 });
    }
}

injected(
    UserPasswordManagementOperatorImpl,
    USER_PASSWORD_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    HASHER_TOKEN,
    LOGGER_TOKEN
);

export const USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN =
    token<UserPasswordManagementOperator>("UserPasswordManagementOperator");

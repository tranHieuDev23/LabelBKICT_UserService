import {
    BlacklistedTokenDataAccessor,
    UserDataAccessor,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";

export interface TokenManagementOperator {
    getUserFromToken(token: string): Promise<User>;
    blacklistToken(token: string): Promise<void>;
}

export class TokenManagementOperatorImpl implements TokenManagementOperator {
    constructor(
        private readonly blacklistedTokenDM: BlacklistedTokenDataAccessor,
        private readonly userDM: UserDataAccessor
    ) {}

    getUserFromToken(token: string): Promise<User> {
        throw new Error("Method not implemented.");
    }

    blacklistToken(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

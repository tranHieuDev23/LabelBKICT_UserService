import { injected, token } from "brandi";
import {
    BlacklistedTokenDataAccessor,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    UserDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
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

injected(
    TokenManagementOperatorImpl,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN
);

export const TOKEN_MANAGEMENT_OPERATOR_TOKEN = token<TokenManagementOperator>(
    "TokenManagementOperator"
);

import { injected, token } from "brandi";
import { Logger } from "winston";
import { 
    TokenManagementOperator, 
    TOKEN_MANAGEMENT_OPERATOR_TOKEN 
} from "../module/token";
import { LOGGER_TOKEN } from "../utils";

export interface DeleteExpiredBlacklistedTokenJob {
    execute(): Promise<void>;
}

export class DeleteExpiredBlacklistedTokenJobImpl implements DeleteExpiredBlacklistedTokenJob {
    constructor(
        private readonly tokenManagementOperator: TokenManagementOperator,
        private readonly logger: Logger
    ) {}
    public async execute(): Promise<void> {
        await this.tokenManagementOperator.deleteExpiredBlacklistedToken(Date.now());
        this.logger.info("Deleted expired blacklisted token successfully");
    }
}

injected(
    DeleteExpiredBlacklistedTokenJobImpl,
    TOKEN_MANAGEMENT_OPERATOR_TOKEN,
    LOGGER_TOKEN,
);

export const DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN = 
    token<DeleteExpiredBlacklistedTokenJob>("DeleteExpiredBlacklistedTokenJob");
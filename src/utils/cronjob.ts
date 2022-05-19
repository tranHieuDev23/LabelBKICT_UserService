import { CronJob } from "cron";
import {
    BlacklistedTokenDataAccessor
} from "../dataaccess/db/blacklisted_token";

class AutoDeleteBlacklistedToken {
    cronJob: CronJob;

    constructor(
        private readonly blacklistedTokenDataAccessor: BlacklistedTokenDataAccessor,
    ) {
        this.cronJob = new CronJob('0 0 */1 * * *', async () => {
            try {
                await this.deleteTokenFunction();
              } catch (e) {
                console.error(e);
              }
        });

        //Start job
        if (!this.cronJob.running) {
            this.cronJob.start();
        }
    }
    async deleteTokenFunction(
    ): Promise<void> {
        let deleteToken: Number;
        deleteToken = await this.blacklistedTokenDataAccessor.deleteExpiredBlacklistedToken(Date.now());
    }
}
let blacklistedTokenDataAccessor: any;
const autoDeleteBlacklistedToken = new AutoDeleteBlacklistedToken(blacklistedTokenDataAccessor);
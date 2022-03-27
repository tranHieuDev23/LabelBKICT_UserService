import { injected, token } from "brandi";
import { Snowflake } from "nodejs-snowflake";
import { DistributedConfig, DISTRIBUTED_CONFIG_TOKEN } from "../config";

export interface IdGenerator {
    Generate(): Promise<number>;
}

export class SnowflakeIdGenerator implements IdGenerator {
    private readonly snowflake: Snowflake;

    constructor(distributedConfig: DistributedConfig) {
        this.snowflake = new Snowflake({
            instance_id: distributedConfig.nodeId,
        });
    }

    public async Generate(): Promise<number> {
        return new Promise<number>((resolve) => {
            resolve(+this.snowflake.getUniqueID().toString(10));
        });
    }
}

injected(SnowflakeIdGenerator, DISTRIBUTED_CONFIG_TOKEN);

export const Id_GENERATOR_TOKEN = token<IdGenerator>("IdGenerator");

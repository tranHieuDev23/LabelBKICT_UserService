module.exports = {
    apps: [
        {
            name: "user_service",
            script: "./dist/main.js",
            args: " --start_grpc_server",
            instances: 16,
            instance_var: "NODE_ID",
        },
        {
            name: "scheduler_auto_detele_expired_blacklist_token",
            script: "./dist/utils/cronjob.js",
            instances: 1,
            instance_var: "NODE_ID",
        }
    ],
};

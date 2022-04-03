module.exports = {
    apps: [
        {
            name: "user_service",
            script: "./dist/main.js",
            instances: 16,
            instance_var: "NODE_ID",
        },
    ],
};

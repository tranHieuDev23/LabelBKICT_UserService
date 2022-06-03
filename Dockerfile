# Build stage
FROM node:16.14.2-bullseye
# Install NodeJs dependencies
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
RUN npm install
RUN npm install -g pm2
# Build package
COPY . .
RUN npm run build
# Start the server with 16 instances
ENV NODE_ENV=production
EXPOSE 20000
# Start the cronjob auto delete expired blacklisted token 
COPY deploy/cron.d /etc/cron.d
RUN chmod 0644 /etc/cron.d && 
    crontab /etc/cron.d
RUN cron
ENTRYPOINT ["sh", "./scripts/start_service.sh"]
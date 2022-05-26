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
ENTRYPOINT ["sh", "./scripts/start_service.sh"] 
# Start the cronjob auto delete expired blacklisted token 
RUN apt-get update && apt-get install -y cron
COPY delete_expired_blacklisted_token_job /etc/cron.d/delete_expired_blacklisted_token_job
RUN chmod 0644 /etc/cron.d/delete_expired_blacklisted_token_job &&
    crontab /etc/cron.d/delete_expired_blacklisted_token_job

# Create the log file to be able to run tail
RUN touch /var/log/cron.log
 
# Run the command on container startup
CMD cron && tail -f /var/log/cron.log
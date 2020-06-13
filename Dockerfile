FROM node:10.21.0-alpine3.11

WORKDIR /app

# Create directories for manage the backups information
RUN mkdir backups
RUN mkdir images
RUN mkdir compress_files

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy script files auth key
COPY setup-store.js ./
COPY compress-files.js ./
COPY upload.js ./
COPY cron-app.js ./
COPY store-key.json ./

CMD ["npm", "start"]

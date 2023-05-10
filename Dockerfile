FROM node:16.20.0-alpine3.16

WORKDIR /app

# Create directories for manage the backups information
RUN mkdir backups
RUN mkdir images
RUN mkdir compress_files

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy script files auth key
COPY .scripts ./scripts

CMD ["npm", "start"]

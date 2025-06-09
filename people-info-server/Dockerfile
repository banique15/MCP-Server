FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY index.js ./
COPY .env ./

# Make the index.js file executable
RUN chmod +x index.js

# Expose stdin and stdout for stdio communication
ENTRYPOINT ["node", "index.js"]
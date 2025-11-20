# Use official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all application files
COPY . .

# Expose the app port
EXPOSE 3015

# Start the application in production mode
CMD ["npm", "run", "start:production"]

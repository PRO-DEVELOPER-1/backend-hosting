# Use the official Node.js 16 image
FROM node:16

# Install system dependencies
RUN apt-get update && \
    apt-get install -y git python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 10000

# Start command
CMD ["npm", "start"]

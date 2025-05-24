# Use the official Node.js 16 image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json into the container
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Build the application (optional — only if your app has a build step)
RUN npm run build || echo "No build script, skipping..."

# Expose the desired port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]

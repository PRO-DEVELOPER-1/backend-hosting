# Stage 1: Build environment
FROM node:16 AS builder

# Install system dependencies including git and Docker CLI
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application files
COPY . .

# Stage 2: Runtime environment
FROM node:16-slim

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["node", "index.js"]

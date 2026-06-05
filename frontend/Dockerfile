FROM node:20-alpine AS base

# Install dependencies only when needed
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Expose port 3000
EXPOSE 3000

# Next.js dev server configuration
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]

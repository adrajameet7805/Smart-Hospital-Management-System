FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY backend/src/ ./src/

# Copy database migrations
COPY database/ /database/

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

CMD ["npm", "start"]
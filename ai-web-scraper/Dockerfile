# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the rest of the application source code
COPY . .

# Build the project
RUN npm run build

# Expose port if needed (update if your server uses another port)
# EXPOSE 3000

ENV JIGSAWSTACK_API_KEY=<YOUR_KEY>

# Start the server
CMD ["npm", "start"]

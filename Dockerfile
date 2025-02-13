# Use official Node.js runtime as a parent image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies inside the container (force clean install)
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Expose the application's port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]

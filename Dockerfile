FROM node:16

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json first
COPY api/package*.json ./  

# Install dependencies
RUN npm install --force

# Copy the entire 'api' directory to the working directory
COPY ./api ./  

# Ensure the .env file is also copied
COPY api/.env .env  

# Expose port 8080
EXPOSE 8080  

# Start the application using 'server.js'
CMD ["node", "server.js"]

FROM node:14

# Install additional dependencies if needed
RUN apt-get update && apt-get install -y vim git gnupg2 curl jq

# Set the working directory
WORKDIR /lgtv-alexa-skill

# Copy the project files into the container
COPY . /lgtv-alexa-skill

# Install project dependencies
RUN npm install

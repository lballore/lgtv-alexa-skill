FROM node:23

# Install additional dependencies if needed
RUN apt-get update && apt-get install -y sudo vim git gnupg2 curl jq
RUN npm install -g pkg

# Set the working directory
WORKDIR /lgtv-alexa-skill

# Copy the project files into the container
COPY . /lgtv-alexa-skill

# Install project dependencies
RUN npm install

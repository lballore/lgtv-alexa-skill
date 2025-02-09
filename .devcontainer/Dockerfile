FROM node:23

# Install additional dependencies if needed
RUN apt-get update && apt-get install -y sudo vim git gnupg2 curl jq tcpdump
RUN apt-get update && apt-get install -y sudo && \
    echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node
RUN npm install -g pkg

# Expose the ports
EXPOSE 11000-11003
EXPOSE 11101
# Add WoL UDP port
EXPOSE 9/udp
EXPOSE 1900/udp

# Copy the project files into the container
COPY . /lgtv-alexa-skill

# Set the working directory
WORKDIR /lgtv-alexa-skill

# Install project dependencies
RUN npm install

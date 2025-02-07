#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define the entry point of your application
ENTRY_POINT="app.js"

# Define the output binary name
OUTPUT_BINARY="./bin/lgtv"

# Check if nexe is installed
if ! command -v pkg &> /dev/null
then
    echo "pkg could not be found, installing..."
    npm install -g pkg
fi

# Build the application using pkg
echo "Building the application..."
pkg $ENTRY_POINT -o $OUTPUT_BINARY

echo "Build completed successfully."

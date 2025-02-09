#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define the entry point of your application
ENTRY_POINT="index.js"

# Define the output binary name
OUTPUT_BINARY="./bin/lgtv"

# Check if pkg is installed
if ! command -v pkg &> /dev/null
then
    echo "pkg could not be found, installing..."
    npm install -g pkg
fi

# Check if target parameter is provided
if [ -z "$1" ]
then
    echo "No target provided. Usage: ./build_app.sh <target> (e.g. node14-linux-arm64)"
    exit 1
fi

TARGET=$1

# Build the application using pkg
echo "Building the application..."
pkg $ENTRY_POINT -o $OUTPUT_BINARY -t $TARGET

echo "Build completed successfully."

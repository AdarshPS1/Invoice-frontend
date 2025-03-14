#!/usr/bin/env bash
# Build script for Render

# Exit on error
set -o errexit

# Install dependencies
npm install

# Build the app
npm run build

# Install production dependencies for the server
npm install --production=true express path 
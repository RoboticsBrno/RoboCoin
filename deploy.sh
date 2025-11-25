#!/bin/bash

# --- RoboCoin Deployment Script ---
#
# This script automates the deployment of the RoboCoin application.
# It handles everything from installing dependencies to running database
# migrations and starting the production server.
#
# Prerequisites:
#   - Node.js and npm must be installed on the server.
#   - Git must be installed on the server.
#   - You must have a production database (e.g., PostgreSQL) ready.
#
# How to Use:
#   1.  Clone your repository to the deployment server.
#   2.  Create a `.env` file by copying `.env.example` and filling
#       in your production database URL and NextAuth secret.
#   3.  Make this script executable by running: chmod +x deploy.sh
#   4.  Run the script: ./deploy.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# --- 1. Environment Setup ---
echo "Setting up environment..."

# Check if the .env.local file exists. If not, exit with an error.
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in your production values."
    exit 1
fi

# --- 2. Install Dependencies ---
echo "Installing dependencies..."

# Install the exact versions of dependencies specified in package-lock.json.
# This ensures a consistent and reliable build.
npm ci

# --- 3. Database Migration ---
echo "Running database migrations..."

# Apply any pending Prisma schema changes to the production database.
# This ensures your database schema is up-to-date with your application code.
npx prisma migrate deploy

# --- 4. Build the Application ---
echo "Building the application for production..."

# Compile and optimize the Next.js application for production.
# This creates a highly optimized build in the .next directory.
npm run build

# --- 5. Start the Production Server ---
echo "Starting the production server..."

# Start the Next.js production server. It's recommended to use a process
# manager like PM2 to keep the application running continuously.
#
# Example with PM2:
# pm2 start npm --name "robocoin" -- start
#
# For this script, we will start it directly. You can stop it with Ctrl+C.
# In a real-world scenario, you would use a process manager.
npm start

echo "Deployment successful! RoboCoin is now running."

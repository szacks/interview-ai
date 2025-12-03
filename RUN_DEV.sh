#!/bin/bash

# Run the Next.js development server with correct Node version

cd "$(dirname "$0")/frontend"

echo "Starting Next.js development server..."
echo "Login page will be available at: http://localhost:3000/login"
echo "Test page: http://localhost:3000/test"
echo ""

~/.nvm/versions/node/v22.21.1/bin/pnpm dev

#!/bin/bash

# Add this to your ~/.bashrc or ~/.zshrc to use these commands globally

# Use Node 22.21.1 with pnpm
alias pnpm="~/.nvm/versions/node/v22.21.1/bin/pnpm"
alias npm="~/.nvm/versions/node/v22.21.1/bin/npm"
alias node="~/.nvm/versions/node/v22.21.1/bin/node"

# Project shortcuts
alias interview-ai-dev="cd ~/personalProjects/interviewAI/frontend/interview-platform-mvp && ~/.nvm/versions/node/v22.21.1/bin/pnpm dev"
alias interview-ai="cd ~/personalProjects/interviewAI"

echo "Aliases added! You can now use:"
echo "  - pnpm dev (from the project directory)"
echo "  - interview-ai-dev (to start dev server)"
echo "  - interview-ai (to go to project root)"

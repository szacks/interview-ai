FROM node:20-alpine

# Security: Create non-root user
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

# Set up working directory
WORKDIR /app
RUN chown sandbox:sandbox /app

# Switch to non-root user
USER sandbox

# Default command (overridden at runtime)
CMD ["node", "solution.js"]

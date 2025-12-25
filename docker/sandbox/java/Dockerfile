FROM eclipse-temurin:21-jdk-alpine

# Security: Create non-root user
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

# Set up working directory
WORKDIR /app
RUN chown sandbox:sandbox /app

# Switch to non-root user
USER sandbox

# Default command
CMD ["sh", "-c", "javac Solution.java && java Solution"]

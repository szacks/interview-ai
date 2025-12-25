#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building JavaScript sandbox..."
docker build -t interviewai-node-sandbox:latest "$SCRIPT_DIR/javascript"

echo "Building Python sandbox..."
docker build -t interviewai-python-sandbox:latest "$SCRIPT_DIR/python"

echo "Building Java sandbox..."
docker build -t interviewai-java-sandbox:latest "$SCRIPT_DIR/java"

echo ""
echo "All sandbox images built successfully!"
echo ""
echo "Images created:"
docker images | grep interviewai

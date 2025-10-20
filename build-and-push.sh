#!/bin/bash
set -e

# French Laundry Bot - Build and Push Script
# This script builds the Docker image and pushes it to GitHub Container Registry

# Configuration
IMAGE_NAME="ghcr.io/chadchappy/flbot"
VERSION="${1:-latest}"

echo "================================================"
echo "French Laundry Bot - Build and Push"
echo "================================================"
echo "Image: $IMAGE_NAME:$VERSION"
echo "================================================"

# Build the Docker image
echo ""
echo "Step 1: Building Docker image..."
docker build -t $IMAGE_NAME:$VERSION -f Dockerfile .

# Tag as latest if a specific version was provided
if [ "$VERSION" != "latest" ]; then
    echo ""
    echo "Step 2: Tagging as latest..."
    docker tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest
fi

# Push to GitHub Container Registry
echo ""
echo "Step 3: Pushing to GitHub Container Registry..."
docker push $IMAGE_NAME:$VERSION

if [ "$VERSION" != "latest" ]; then
    docker push $IMAGE_NAME:latest
fi

echo ""
echo "================================================"
echo "✓ Build and push completed successfully!"
echo "================================================"
echo "Image: $IMAGE_NAME:$VERSION"
echo ""
echo "To deploy to Kubernetes:"
echo "  ./deploy-to-k8s.sh"
echo "================================================"


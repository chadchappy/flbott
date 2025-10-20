#!/bin/bash
set -e

# French Laundry Bot - Kubernetes Deployment Script
# This script deploys the bot to your Kubernetes cluster

CLUSTER="${1:-us-demo-west}"
NAMESPACE="${2:-default}"

echo "================================================"
echo "French Laundry Bot - Kubernetes Deployment"
echo "================================================"
echo "Cluster: $CLUSTER"
echo "Namespace: $NAMESPACE"
echo "================================================"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "ERROR: kubectl is not installed or not in PATH"
    exit 1
fi

# Set the cluster context (if needed)
if [ "$CLUSTER" != "current" ]; then
    echo ""
    echo "Step 1: Setting cluster context..."
    kubectl config use-context $CLUSTER || echo "Warning: Could not set context to $CLUSTER, using current context"
fi

# Create namespace if it doesn't exist
echo ""
echo "Step 2: Ensuring namespace exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply the secret (you should have already edited k8s-secret.yaml with your credentials)
echo ""
echo "Step 3: Creating/updating secret..."
echo "NOTE: Make sure you've edited k8s-secret.yaml with your base64-encoded credentials!"
read -p "Have you updated k8s-secret.yaml with your credentials? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update k8s-secret.yaml first, then run this script again."
    exit 1
fi

kubectl apply -f k8s-secret.yaml -n $NAMESPACE

# Apply the deployment
echo ""
echo "Step 4: Deploying the bot..."
kubectl apply -f k8s-deployment.yaml -n $NAMESPACE

# Wait for deployment to be ready
echo ""
echo "Step 5: Waiting for deployment to be ready..."
kubectl rollout status deployment/french-laundry-bot -n $NAMESPACE --timeout=300s

# Show the pod status
echo ""
echo "Step 6: Checking pod status..."
kubectl get pods -n $NAMESPACE -l app=french-laundry-bot

echo ""
echo "================================================"
echo "✓ Deployment completed successfully!"
echo "================================================"
echo ""
echo "Useful commands:"
echo "  View logs:    kubectl logs -f deployment/french-laundry-bot -n $NAMESPACE"
echo "  Get pods:     kubectl get pods -n $NAMESPACE -l app=french-laundry-bot"
echo "  Describe pod: kubectl describe pod -n $NAMESPACE -l app=french-laundry-bot"
echo "  Delete:       kubectl delete -f k8s-deployment.yaml -n $NAMESPACE"
echo "================================================"


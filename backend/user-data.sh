#!/bin/bash
set -e

REGION="us-east-1"
ECR_REPO="981498564070.dkr.ecr.us-east-1.amazonaws.com/exercisetracker-api:latest"

# Authenticate Docker with ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin 981498564070.dkr.ecr.us-east-1.amazonaws.com

# Pull latest image
docker pull $ECR_REPO

# Fetch secrets from SSM Parameter Store
get_param() {
  aws ssm get-parameter --region $REGION --name "/exercisetracker/$1" --with-decryption --query "Parameter.Value" --output text
}

# Run container with env vars from SSM
docker run -d \
  --name exercisetracker \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV="$(get_param NODE_ENV)" \
  -e PORT="$(get_param PORT)" \
  -e MONGODB_URI="$(get_param MONGODB_URI)" \
  -e ACCESS_TOKEN_SECRET="$(get_param ACCESS_TOKEN_SECRET)" \
  -e REFRESH_TOKEN_SECRET="$(get_param REFRESH_TOKEN_SECRET)" \
  -e CORS_ORIGIN="$(get_param CORS_ORIGIN)" \
  $ECR_REPO

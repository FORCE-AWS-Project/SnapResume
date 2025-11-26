#!/bin/bash

# SnapResume Lambda Deployment Script
# This script packages and deploys the Lambda function

set -e

echo "🚀 SnapResume Lambda Deployment"
echo "================================"

# Configuration
FUNCTION_NAME="${1:-snapresume-dev-api}"
REGION="${2:-us-east-1}"
LAMBDA_DIR="lambda"
ZIP_FILE="lambda-function.zip"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -d "$LAMBDA_DIR" ]; then
  echo -e "${RED}Error: lambda directory not found. Please run this script from the backend directory.${NC}"
  exit 1
fi

# Navigate to lambda directory
cd "$LAMBDA_DIR"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install --production

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to install dependencies${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"

# Remove old zip if exists
rm -f "$ZIP_FILE"

# Create zip file
zip -r "$ZIP_FILE" . \
  -x "*.git*" \
  -x "node_modules/.cache/*" \
  -x "test/*" \
  -x "*.md" \
  -x ".gitignore"

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to create zip file${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Deployment package created: $ZIP_FILE${NC}"

# Get package size
ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo -e "Package size: ${GREEN}$ZIP_SIZE${NC}"

echo -e "${YELLOW}Step 3: Deploying to AWS Lambda...${NC}"

# Deploy to Lambda
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$REGION" \
  --output json

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to deploy to Lambda${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Lambda function deployed successfully${NC}"

# Wait for function to be active
echo -e "${YELLOW}Step 4: Waiting for function to be active...${NC}"

aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION"

echo -e "${GREEN}✓ Function is active${NC}"

# Get function info
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"

FUNCTION_INFO=$(aws lambda get-function \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION" \
  --query 'Configuration.[FunctionName,Runtime,LastModified,CodeSize]' \
  --output text)

echo -e "${GREEN}Function Details:${NC}"
echo "$FUNCTION_INFO"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo ""
echo "To test the API, use:"
echo "curl https://your-api-gateway-url/api/users/me -H 'Authorization: Bearer YOUR_TOKEN'"

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
rm -f "$ZIP_FILE"
echo -e "${GREEN}✓ Cleanup complete${NC}"

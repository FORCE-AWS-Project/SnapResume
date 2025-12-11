#!/bin/bash

# Load sample templates into DynamoDB
# Usage: ./load-templates.sh [table-name] [region]

set -e

TABLE_NAME="${1:-snapresume-dev-templates}"
REGION="${2:-us-east-1}"

echo "Loading sample templates into DynamoDB..."
echo "Table: $TABLE_NAME"
echo "Region: $REGION"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq first."
  echo "  macOS: brew install jq"
  echo "  Ubuntu: sudo apt-get install jq"
  exit 1
fi

# Load templates
TEMPLATES=$(cat templates.json)
TEMPLATE_COUNT=$(echo "$TEMPLATES" | jq length)

echo "Found $TEMPLATE_COUNT templates to load"
echo ""

# Load each template
for i in $(seq 0 $(($TEMPLATE_COUNT - 1))); do
  TEMPLATE=$(echo "$TEMPLATES" | jq -c ".[$i]")
  TEMPLATE_ID=$(echo "$TEMPLATE" | jq -r '.templateId')
  TEMPLATE_NAME=$(echo "$TEMPLATE" | jq -r '.name')

  echo "Loading template: $TEMPLATE_NAME ($TEMPLATE_ID)"

  aws dynamodb put-item \
    --table-name "$TABLE_NAME" \
    --item "$(echo "$TEMPLATE" | jq -c '{
      PK: {S: .PK},
      SK: {S: .SK},
      GSI1PK: {S: .GSI1PK},
      GSI1SK: {S: .GSI1SK},
      templateId: {S: .templateId},
      name: {S: .name},
      category: {S: .category},
      templateFileUrl: {S: .templateFileUrl},
      previewImageUrl: {S: .previewImageUrl},
      inputDataSchema: {S: (.inputDataSchema | tostring)},
      createdAt: {S: .createdAt},
      updatedAt: {S: .updatedAt}
    }')" \
    --region "$REGION"

  if [ $? -eq 0 ]; then
    echo "✓ Loaded successfully"
  else
    echo "✗ Failed to load"
  fi

  echo ""
done

echo "Template loading complete!"
echo ""
echo "To verify, run:"
echo "aws dynamodb scan --table-name $TABLE_NAME --region $REGION"

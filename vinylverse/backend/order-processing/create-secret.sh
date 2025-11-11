#!/bin/bash

# Script to create AWS Secrets Manager secret with database credentials
# Usage: ./create-secret.sh [secret-name]

SECRET_NAME="${1:-vinylverse-db-credentials}"
REGION="${AWS_REGION:-us-east-2}"

echo "=========================================="
echo "Creating AWS Secrets Manager Secret"
echo "=========================================="
echo ""
echo "Secret name: $SECRET_NAME"
echo "Region: $REGION"
echo ""

# Database credentials
SECRET_JSON='{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "admin",
  "password": "VinylVerse",
  "database": "VinylVerseDB",
  "port": 3306
}'

echo "Creating secret with these credentials:"
echo "$SECRET_JSON" | jq .
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed!"
    echo "Install it: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if secret already exists
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$REGION" &> /dev/null; then
    echo "⚠️  Secret '$SECRET_NAME' already exists!"
    read -p "Do you want to update it? (y/n): " UPDATE
    if [ "$UPDATE" = "y" ] || [ "$UPDATE" = "Y" ]; then
        echo "Updating secret..."
        aws secretsmanager update-secret \
            --secret-id "$SECRET_NAME" \
            --secret-string "$SECRET_JSON" \
            --region "$REGION"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✓ Secret updated successfully!"
        else
            echo ""
            echo "✗ Failed to update secret"
            exit 1
        fi
    else
        echo "Keeping existing secret. Exiting."
        exit 0
    fi
else
    echo "Creating new secret..."
    aws secretsmanager create-secret \
        --name "$SECRET_NAME" \
        --description "Database credentials for VinylVerse order processing" \
        --secret-string "$SECRET_JSON" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Secret created successfully!"
    else
        echo ""
        echo "✗ Failed to create secret"
        exit 1
    fi
fi

echo ""
echo "Getting secret ARN..."
ARN=$(aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$REGION" --query 'ARN' --output text)

if [ $? -eq 0 ] && [ -n "$ARN" ]; then
    echo ""
    echo "=========================================="
    echo "✓ SUCCESS!"
    echo "=========================================="
    echo ""
    echo "Secret ARN:"
    echo "$ARN"
    echo ""
    echo "=========================================="
    echo "Next Steps:"
    echo "=========================================="
    echo ""
    echo "1. Copy the ARN above"
    echo ""
    echo "2. Go to AWS Lambda Console:"
    echo "   https://console.aws.amazon.com/lambda/"
    echo ""
    echo "3. Find your order-processing Lambda function"
    echo ""
    echo "4. Go to: Configuration → Environment variables"
    echo ""
    echo "5. Add/Edit environment variable:"
    echo "   Key:   SECRET_ARN"
    echo "   Value: $ARN"
    echo ""
    echo "6. Save and test your Lambda function!"
    echo ""
else
    echo ""
    echo "⚠️  Could not retrieve ARN. You can find it in AWS Console:"
    echo "   https://console.aws.amazon.com/secretsmanager/"
    echo ""
fi


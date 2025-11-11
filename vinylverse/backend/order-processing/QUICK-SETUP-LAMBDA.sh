#!/bin/bash

# Quick script to add SECRET_ARN to Lambda via AWS CLI
# Usage: ./QUICK-SETUP-LAMBDA.sh [function-name]

FUNCTION_NAME="${1:-vinylverse-order-processing}"
REGION="${AWS_REGION:-us-east-2}"
SECRET_ARN="arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE"

echo "=========================================="
echo "Adding SECRET_ARN to Lambda"
echo "=========================================="
echo ""
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Secret ARN: $SECRET_ARN"
echo ""

# Check if function exists
if ! aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "❌ Lambda function '$FUNCTION_NAME' not found!"
    echo ""
    echo "Available functions:"
    aws lambda list-functions --region "$REGION" --query 'Functions[].FunctionName' --output table
    echo ""
    echo "Usage: ./QUICK-SETUP-LAMBDA.sh your-function-name"
    exit 1
fi

# Get current environment variables
echo "Getting current environment variables..."
CURRENT_ENV=$(aws lambda get-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --query 'Environment.Variables' \
    --output json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get current environment variables"
    exit 1
fi

# Add SECRET_ARN to environment variables
echo "Adding SECRET_ARN..."
UPDATED_ENV=$(echo "$CURRENT_ENV" | jq --arg arn "$SECRET_ARN" '. + {SECRET_ARN: $arn}')

# Update Lambda
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --environment "Variables=$UPDATED_ENV" \
    > /dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully added SECRET_ARN to Lambda!"
    echo ""
    echo "Verifying..."
    sleep 2
    aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION" \
        --query 'Environment.Variables.SECRET_ARN' \
        --output text
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✅ Setup Complete!"
        echo "=========================================="
        echo ""
        echo "Your Lambda now has access to the database secret!"
        echo ""
        echo "Next: Test your Lambda function or API Gateway endpoint"
    fi
else
    echo ""
    echo "❌ Failed to update Lambda"
    echo "You may need to add it manually via AWS Console"
    exit 1
fi


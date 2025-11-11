#!/bin/bash

# Automated Deployment Script for Order Processing Lambda
# Usage: ./deploy.sh [function-name] [region]

FUNCTION_NAME="${1:-vinylverse-order-processing}"
REGION="${2:-us-east-2}"

echo "=========================================="
echo "Deploying Order Processing Lambda"
echo "=========================================="
echo "Function Name: $FUNCTION_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "❌ Error: index.js not found. Please run this script from backend/order-processing directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Create deployment package
echo "📦 Step 2: Creating deployment package..."
zip -r ../../order-lambda.zip . -x "*.git*" -x "*.md" -x "test-*" -x "*.sh" -x "*.sql" -x "*.json" | grep -v "test"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create zip file"
    exit 1
fi
echo "✓ Created order-lambda.zip"
echo ""

# Step 3: Check if function exists
echo "🔍 Step 3: Checking if Lambda function exists..."
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Function doesn't exist. Creating new function..."
    echo ""
    echo "Please provide the following information:"
    read -p "Runtime (nodejs18.x or nodejs20.x) [default: nodejs18.x]: " RUNTIME
    RUNTIME="${RUNTIME:-nodejs18.x}"
    
    read -p "IAM Role ARN for Lambda (or press Enter to create manually): " ROLE_ARN
    
    if [ -z "$ROLE_ARN" ]; then
        echo ""
        echo "⚠️  You need to create a Lambda execution role first."
        echo "   Go to IAM Console → Roles → Create role"
        echo "   Select 'Lambda' → Attach policies: AWSLambdaBasicExecutionRole"
        echo "   Then run this script again with the role ARN"
        exit 1
    fi
    
    echo "Creating Lambda function..."
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime "$RUNTIME" \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://../../order-lambda.zip \
        --timeout 30 \
        --memory-size 256 \
        --region "$REGION"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create Lambda function"
        exit 1
    fi
    echo "✓ Lambda function created"
else
    echo "✓ Function exists. Updating code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://../../order-lambda.zip \
        --region "$REGION"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to update Lambda function"
        exit 1
    fi
    echo "✓ Lambda function code updated"
fi
echo ""

# Step 4: Check environment variables
echo "🔍 Step 4: Checking environment variables..."
CURRENT_ENV=$(aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --region "$REGION" --query 'Environment.Variables' --output json 2>/dev/null)

if echo "$CURRENT_ENV" | grep -q "SECRET_ARN"; then
    echo "✓ SECRET_ARN is already set"
else
    echo "⚠️  SECRET_ARN is not set!"
    echo ""
    read -p "Enter Secrets Manager ARN (or press Enter to skip): " SECRET_ARN
    
    if [ ! -z "$SECRET_ARN" ]; then
        aws lambda update-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --environment "Variables={SECRET_ARN=$SECRET_ARN,AWS_REGION=$REGION}" \
            --region "$REGION"
        
        if [ $? -eq 0 ]; then
            echo "✓ Environment variables updated"
        else
            echo "❌ Failed to update environment variables"
        fi
    else
        echo "⚠️  Skipping. Please set SECRET_ARN manually in Lambda console"
    fi
fi
echo ""

# Step 5: Summary
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo "✓ Code packaged: order-lambda.zip"
echo "✓ Lambda function: $FUNCTION_NAME"
echo "✓ Region: $REGION"
echo ""
echo "Next steps:"
echo "1. Verify SECRET_ARN is set in Lambda environment variables"
echo "2. Configure API Gateway to trigger this Lambda"
echo "3. Test the endpoint"
echo ""
echo "To test locally first:"
echo "  node test-db-connection.js"
echo ""
echo "To test via API Gateway:"
echo "  ./test-order.sh https://YOUR_API_GATEWAY_URL/dev"
echo ""


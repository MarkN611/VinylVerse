#!/bin/bash

# Check if secret already exists
# Usage: ./check-secret.sh

REGION="${AWS_REGION:-us-east-2}"

echo "Checking for existing secrets..."
echo ""

# List all secrets and look for vinylverse
aws secretsmanager list-secrets --region "$REGION" --query 'SecretList[?contains(Name, `vinylverse`) || contains(Name, `VinylVerse`)].{Name:Name,ARN:ARN}' --output table 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "If you see a secret above, you can use its ARN!"
    echo ""
    echo "To get the full ARN:"
    echo "  aws secretsmanager describe-secret --secret-id vinylverse-db-credentials --region $REGION --query 'ARN' --output text"
else
    echo ""
    echo "Could not list secrets (might not have permission)"
    echo "Try checking in AWS Console:"
    echo "  https://console.aws.amazon.com/secretsmanager/home?region=$REGION"
fi


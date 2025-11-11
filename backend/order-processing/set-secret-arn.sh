#!/usr/bin/env bash
# Usage: ./set-secret-arn.sh <LAMBDA_FUNCTION_NAME> <LAMBDA_ROLE_NAME> [SECRET_ARN]

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <LAMBDA_FUNCTION_NAME> <LAMBDA_ROLE_NAME>"
  exit 2
fi

FUNCTION_NAME="$1"
ROLE_NAME="$2"
# Allow optional 3rd argument to override the secret ARN
if [ -n "${3-}" ]; then
  SECRET_ARN="$3"
else
  SECRET_ARN="arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE"
fi

echo "About to set SECRET_ARN for Lambda function: $FUNCTION_NAME"
echo "Secret ARN: $SECRET_ARN"

echo "Updating Lambda environment variable..."
aws lambda update-function-configuration --function-name "$FUNCTION_NAME" --environment "Variables={SECRET_ARN=$SECRET_ARN}"

echo "Attaching inline IAM policy to role: $ROLE_NAME"
POLICY_DOC=$(cat <<EOF
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["secretsmanager:GetSecretValue"],"Resource":"$SECRET_ARN"}]}
EOF
)

aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name AllowSecretsGetValue --policy-document "$POLICY_DOC"

echo "Done. Verify in the Lambda configuration that SECRET_ARN is set and that the role has the inline policy attached."

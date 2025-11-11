Read-only helper Lambda (backend/order-processing/readonly-helper.js)

Purpose
- A tiny Lambda that connects to the same RDS using the same Secrets Manager secret (SECRET_ARN) and runs a few DESCRIBE/SELECT queries. It logs results to CloudWatch so you can inspect the DB without opening the RDS security group to your laptop.

Deploying
1. Zip the helper and install dependencies (mysql2). You can do this locally and upload the ZIP via AWS Console or use the AWS CLI.

Commands (run from this folder):

# create package.json and install dependency
cat > package.json <<'JSON'
{
  "name": "readonly-helper",
  "version": "1.0.0",
  "main": "readonly-helper.js",
  "dependencies": {
    "mysql2": "^3.3.0"
  }
}
JSON

npm install --production

# create zip
zip -r readonly-helper.zip readonly-helper.js node_modules package.json

# then upload using AWS CLI (replace <FUNCTION_NAME> with a new helper name, e.g., VinylVerse-orderhelper)
aws lambda create-function --function-name VinylVerse-orderhelper \
  --zip-file fileb://readonly-helper.zip --handler readonly-helper.handler --runtime nodejs18.x \
  --role arn:aws:iam::439110395438:role/service-role/orderprocessing \
  --environment Variables={SECRET_ARN=arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE} \
  --region us-east-2 --profile admin

# If the function already exists, update the code instead:
aws lambda update-function-code --function-name VinylVerse-orderhelper --zip-file fileb://readonly-helper.zip --region us-east-2 --profile admin

Invocation
- After deployment, invoke the function (from CLI or Console) and then view CloudWatch logs:

aws lambda invoke --function-name VinylVerse-orderhelper --region us-east-2 --profile admin --payload '{}' response.json
cat response.json

# Tail logs
aws logs tail "/aws/lambda/VinylVerse-orderhelper" --region us-east-2 --profile admin --since 1h

Security / IAM
- Use the same role as your order-processing Lambda (it already needs secretsmanager:GetSecretValue and RDS access). If the role lacks GetSecretValue, attach an inline policy:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": ["arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE*"]
    }
  ]
}

Notes
- This Lambda runs read-only queries only. It helps when you cannot open your laptop IP to the DB SG.
- Remove the Lambda after debugging if you don't need it.

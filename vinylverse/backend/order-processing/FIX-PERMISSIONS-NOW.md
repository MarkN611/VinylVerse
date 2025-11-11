# Fix: Lambda Needs Secrets Manager Permission

## The Problem

Error: `User is not authorized to perform: secretsmanager:GetSecretValue`

Your Lambda execution role doesn't have permission to read the secret.

## ✅ Solution: Add IAM Policy

### Step 1: Go to Lambda

1. Go to: https://console.aws.amazon.com/lambda/
2. Find: `VinylVerse-orderprocessing`
3. Click on the function

### Step 2: Find the Execution Role

1. Click **"Configuration"** tab (at top)
2. Click **"Permissions"** (in left sidebar)
3. You'll see **"Execution role"** section
4. Click on the role name (it will say something like `orderprocessing` or `VinylVerse-orderprocessing-role-xxx`)
   - This opens IAM in a new tab

### Step 3: Add Permission

1. In the IAM role page, click **"Add permissions"** button
2. Click **"Create inline policy"**
3. Click the **"JSON"** tab
4. Delete the existing content and paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE"
    }
  ]
}
```

5. Click **"Next"**
6. Policy name: `SecretsManagerAccess`
7. Click **"Create policy"**

### Step 4: Test Again

1. Go back to Lambda Console
2. Click **"Test"** tab
3. Run your test again
4. It should work now! 🎉

## Alternative: Via AWS CLI

If you prefer CLI:

```bash
aws iam put-role-policy \
  --role-name orderprocessing \
  --policy-name SecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE"
      }
    ]
  }'
```

(Replace `orderprocessing` with your actual role name if different)

## ✅ After Adding Permission

Your Lambda will be able to:
- Read the secret from Secrets Manager
- Get database credentials
- Connect to your database
- Persist orders successfully!

## Quick Checklist

- [x] Lambda code uploaded (with aws-sdk)
- [x] SECRET_ARN environment variable set
- [ ] Add Secrets Manager permission to Lambda role ← **DO THIS NOW**
- [ ] Test Lambda function
- [ ] Verify order persists to database


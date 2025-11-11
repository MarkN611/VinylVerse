# Add Secret ARN to Lambda

## ✅ You Have the ARN!

Your secret ARN:
```
arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE
```

## Next Step: Add to Lambda

### Step 1: Go to Lambda Console

1. Open: https://console.aws.amazon.com/lambda/
2. Make sure you're in region: **us-east-2**
3. Find your **order-processing** Lambda function
   - It might be named: `vinylverse-order-processing` or similar
   - Or search for "order" in the function list

### Step 2: Add Environment Variable

1. Click on your Lambda function name
2. Go to the **"Configuration"** tab (at the top)
3. Click **"Environment variables"** (in the left sidebar)
4. Click **"Edit"** button
5. Click **"Add environment variable"**
6. Enter:
   - **Key:** `SECRET_ARN`
   - **Value:** `arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE`
7. Click **"Save"**

### Step 3: Verify Lambda Permissions

Make sure your Lambda can read the secret:

1. Still in Lambda → **Configuration** tab
2. Click **"Permissions"** (in left sidebar)
3. Click on the **Execution role** name (opens IAM in new tab)
4. Check if there's a policy that includes `secretsmanager:GetSecretValue`
5. If not, you need to add it (see below)

### Step 4: Add Secrets Manager Permission (If Needed)

If Lambda doesn't have permission to read secrets:

1. In the IAM role page (from Step 3)
2. Click **"Add permissions"** → **"Create inline policy"**
3. Click **"JSON"** tab
4. Paste this:

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

## ✅ You're Done!

Once you add the `SECRET_ARN` environment variable, your Lambda will be able to:
- Read database credentials from Secrets Manager
- Connect to your `VinylVerseDB` database
- Persist orders successfully!

## Test It!

After adding the environment variable, test your Lambda:

1. Go to Lambda → **Test** tab
2. Create a test event (or use existing)
3. Run the test
4. Check the response - it should connect to the database!

Or test via API Gateway if you have it set up.


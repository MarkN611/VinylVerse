# Fixing AWS Permissions Issue

## The Problem

Your IAM user `mohamednour.2` doesn't have permission to create secrets in AWS Secrets Manager.

Error:
```
AccessDeniedException: User is not authorized to perform: secretsmanager:CreateSecret
```

## Solutions

### Option 1: Use AWS Console (Recommended - Often Has More Permissions)

The AWS Console sometimes has different permissions than the CLI. Try creating the secret manually:

1. **Go to AWS Console:**
   - Open: https://console.aws.amazon.com/secretsmanager/
   - Make sure you're in region: `us-east-2`

2. **Create Secret:**
   - Click **"Store a new secret"**
   - Select **"Other type of secret"**
   - Click **"Plaintext"** tab
   - Paste this JSON:

```json
{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "admin",
  "password": "VinylVerse",
  "database": "VinylVerseDB",
  "port": 3306
}
```

3. **Configure:**
   - Click **"Next"**
   - Secret name: `vinylverse-db-credentials`
   - Click **"Next"** → **"Next"** → **"Store"**

4. **Copy the ARN:**
   - After creating, you'll see the secret details
   - Copy the **ARN** (looks like: `arn:aws:secretsmanager:us-east-2:935724795852:secret:vinylverse-db-credentials-abc123`)

### Option 2: Ask Admin to Add Permissions

If you're using a class account or shared AWS account, ask your instructor/admin to add these permissions to your IAM user:

**Required IAM Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:UpdateSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-2:935724795852:secret:vinylverse-db-credentials*"
    }
  ]
}
```

**Or use this broader policy (if you need to create multiple secrets):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:UpdateSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "*"
    }
  ]
}
```

### Option 3: Use a Different AWS User/Role

If you have access to another AWS user or role with Secrets Manager permissions, you can:

1. Switch AWS credentials:
   ```bash
   aws configure
   ```
   Enter credentials for a user with Secrets Manager permissions

2. Or use a role:
   ```bash
   aws sts assume-role --role-arn arn:aws:iam::935724795852:role/YourRoleName
   ```

### Option 4: Check if Secret Already Exists

Maybe someone else already created it! Check:

```bash
aws secretsmanager list-secrets --region us-east-2 | grep vinylverse
```

Or in AWS Console, check if `vinylverse-db-credentials` already exists.

## Quick Fix: Use AWS Console

**The easiest solution is to use AWS Console** - it often works even when CLI doesn't have permissions.

1. Go to: https://console.aws.amazon.com/secretsmanager/home?region=us-east-2
2. Create the secret manually (see Option 1 above)
3. Copy the ARN
4. Add it to Lambda environment variables

## After Creating the Secret

Once you have the ARN (from Console or after getting permissions):

1. Go to Lambda Console
2. Your order-processing function
3. Configuration → Environment variables
4. Add: `SECRET_ARN` = (the ARN you copied)

## For CSE 5234 Students

If this is for a class:
- Ask your instructor to add Secrets Manager permissions
- Or use AWS Console (it might work even if CLI doesn't)
- Or check if a classmate/admin already created the secret


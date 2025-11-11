# 🚀 Next Steps - Complete Your Setup

You have the database credentials! Now let's finish the setup:

## ✅ What You Have

- ✅ Database is ready: `VinylVerseDB`
- ✅ All tables exist
- ✅ Credentials confirmed:
  - Host: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`
  - User: `admin`
  - Password: `VinylVerse`
  - Database: `VinylVerseDB`
  - Port: `3306`

## 📋 What You Need to Do

### Step 1: Create AWS Secrets Manager Secret

**Option A: Using the Script (Easiest)**

```bash
cd backend/order-processing
./create-secret.sh
```

This will:
- Create the secret automatically
- Show you the ARN you need

**Option B: Using AWS Console (Manual)**

1. Go to [AWS Secrets Manager](https://console.aws.amazon.com/secretsmanager/)
2. Click **"Store a new secret"**
3. Select **"Other type of secret"**
4. Click **"Plaintext"** tab
5. Paste this JSON:

```json
{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "admin",
  "password": "VinylVerse",
  "database": "VinylVerseDB",
  "port": 3306
}
```

6. Click **"Next"**
7. Secret name: `vinylverse-db-credentials`
8. Click **"Next"** → **"Next"** → **"Store"**
9. **COPY THE ARN** (looks like: `arn:aws:secretsmanager:us-east-2:123456789:secret:vinylverse-db-credentials-abc123`)

### Step 2: Update Lambda Environment Variable

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Find your order-processing Lambda function
3. Go to: **Configuration** → **Environment variables**
4. Click **"Edit"**
5. Add/Update:
   - **Key:** `SECRET_ARN`
   - **Value:** (paste the ARN from Step 1)
6. Click **"Save"**

### Step 3: Verify Lambda Permissions

Make sure your Lambda has permission to read Secrets Manager:

1. In Lambda → **Configuration** → **Permissions**
2. Click on the **Execution role** name
3. In IAM, check if there's a policy with `secretsmanager:GetSecretValue`
4. If not, add this permission (see `DEPLOY.md` for details)

### Step 4: Test It!

**Test via API Gateway:**
```bash
curl -X POST https://YOUR_API_URL/dev/order-processing/order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": 1001,
        "name": "Dark Side of the Moon",
        "price": 34.99,
        "qty": 1
      }
    ],
    "customer": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "shipping": {
      "address1": "123 Test St",
      "city": "Columbus",
      "state": "OH",
      "country": "USA",
      "postalCode": "43210"
    },
    "payment": {
      "cardName": "Test User",
      "cardNumber": "4111111111111111",
      "expiration": "12/25"
    },
    "total": 34.99
  }'
```

**Expected Response:**
```json
{
  "confirmationId": "ORD-1234567890-abc123",
  "orderId": 6,
  "status": "confirmed",
  "message": "Order successfully persisted to database"
}
```

## 🎯 Quick Checklist

- [ ] Create Secrets Manager secret
- [ ] Copy the ARN
- [ ] Add `SECRET_ARN` to Lambda environment variables
- [ ] Verify Lambda has Secrets Manager permissions
- [ ] Test with a real order
- [ ] Verify order appears in database

## 🆘 Troubleshooting

**"SECRET_ARN not set"**
- Make sure you added the environment variable in Lambda

**"Secret not found"**
- Check the ARN is correct
- Verify Lambda has `secretsmanager:GetSecretValue` permission

**"Unknown database"**
- Make sure secret has `"database": "VinylVerseDB"` (capital V, D, B)

**"Can't connect to database"**
- Check Lambda is in same VPC as RDS (if RDS is in VPC)
- Verify security group allows Lambda to access RDS (port 3306)

## ✅ You're Almost Done!

Once you complete these steps, Lab 8 Objective 5 will be fully functional! 🎉


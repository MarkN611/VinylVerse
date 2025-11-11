# ✅ Final Checklist - Lab 8 Objective 5

## What's Done ✅

- [x] Database is set up: `VinylVerseDB`
- [x] All tables exist (ITEM, SHIPPING_INFO, PAYMENT_INFO, CUSTOMER_ORDER, CUSTOMER_ORDER_LINE_ITEM)
- [x] Database credentials confirmed
- [x] Secrets Manager secret created
- [x] Secret ARN: `arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE`
- [x] Lambda code is ready (`index.js` persists orders to database)

## What's Next 🔄

### Step 1: Add SECRET_ARN to Lambda (CRITICAL!)

**Your Lambda function needs to know where to find the secret.**

1. Go to: https://console.aws.amazon.com/lambda/
2. Find your **order-processing** Lambda function
   - Common names: `vinylverse-order-processing`, `order-processing`, `order-lambda`
3. Click on the function name
4. Go to: **Configuration** → **Environment variables**
5. Click **"Edit"**
6. Click **"Add environment variable"**
7. Enter:
   - **Key:** `SECRET_ARN`
   - **Value:** `arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE`
8. Click **"Save"**

### Step 2: Verify Lambda Permissions

Make sure Lambda can read the secret:

1. In Lambda → **Configuration** → **Permissions**
2. Click on the **Execution role** name
3. Check if there's a policy with `secretsmanager:GetSecretValue`
4. If not, add it (see below)

**Add Permission (if needed):**

1. In IAM role → **"Add permissions"** → **"Create inline policy"**
2. Click **"JSON"** tab
3. Paste:

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

4. Click **"Next"** → Name it `SecretsManagerAccess` → **"Create policy"**

### Step 3: Test Your Lambda

**Option A: Test in Lambda Console**

1. Go to Lambda → **Test** tab
2. Create a new test event
3. Use this JSON:

```json
{
  "httpMethod": "POST",
  "body": "{\"items\":[{\"id\":1001,\"name\":\"Dark Side of the Moon\",\"price\":34.99,\"qty\":1}],\"customer\":{\"name\":\"Test User\",\"email\":\"test@example.com\"},\"shipping\":{\"address1\":\"123 Test St\",\"city\":\"Columbus\",\"state\":\"OH\",\"country\":\"USA\",\"postalCode\":\"43210\"},\"payment\":{\"cardName\":\"Test User\",\"cardNumber\":\"4111111111111111\",\"expiration\":\"12/25\"},\"total\":34.99}"
}
```

4. Click **"Test"**
5. Check the response - should return `confirmationId` and `orderId`

**Option B: Test via API Gateway**

If you have API Gateway set up:

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

**Expected Success Response:**
```json
{
  "confirmationId": "ORD-1234567890-abc123",
  "orderId": 6,
  "status": "confirmed",
  "message": "Order successfully persisted to database"
}
```

### Step 4: Verify Order in Database

After a successful test, verify the order was saved:

```bash
cd backend/order-processing
node verify-setup.js
```

Or connect to database and run:
```sql
SELECT * FROM CUSTOMER_ORDER ORDER BY CREATED_AT DESC LIMIT 1;
```

## 🎯 Quick Summary

1. **Add `SECRET_ARN` to Lambda** ← Do this first!
2. **Verify Lambda permissions** (if needed)
3. **Test Lambda function**
4. **Verify order in database**

## ✅ When You're Done

Once you complete these steps:
- ✅ Lab 8 Objective 5 is COMPLETE!
- ✅ Orders will persist to database
- ✅ You'll get confirmation IDs
- ✅ Inventory will be updated automatically

## 🆘 Troubleshooting

**"SECRET_ARN not set"**
- Make sure you added the environment variable in Lambda

**"AccessDeniedException" when Lambda runs**
- Lambda needs `secretsmanager:GetSecretValue` permission

**"Unknown database"**
- Check the secret has `"database": "VinylVerseDB"` (capital V, D, B)

**"Can't connect to database"**
- Check Lambda is in same VPC as RDS (if RDS is in VPC)
- Verify security group allows Lambda → RDS (port 3306)


# Step-by-Step Deployment Guide

Follow these steps to deploy your order-processing Lambda function.

## Prerequisites Checklist

- [ ] AWS account with access to Lambda, API Gateway, RDS, and Secrets Manager
- [ ] AWS CLI installed and configured (or use AWS Console)
- [ ] Database is set up at `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`
- [ ] Database tables created (run `schema.sql`)

---

## Step 1: Package Your Lambda Code

### 1.1 Install Dependencies

```bash
cd backend/order-processing
npm install
```

This installs `mysql2` and `aws-sdk` (already included in Lambda runtime).

### 1.2 Create Deployment Package

```bash
# Make sure you're in backend/order-processing directory
zip -r ../../order-lambda.zip .
```

This creates a zip file with:
- `index.js` (your Lambda function)
- `node_modules/` (dependencies)
- `package.json`

**Note:** The zip file will be created in the project root directory.

---

## Step 2: Create AWS Secrets Manager Secret

### 2.1 Via AWS Console

1. Go to [AWS Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/)
2. Click **"Store a new secret"**
3. Select **"Other type of secret"**
4. Choose **"Plaintext"** tab
5. Paste this JSON (replace with your actual values):

```json
{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "your_db_username",
  "password": "your_db_password",
  "database": "your_database_name",
  "port": 3306
}
```

6. Click **"Next"**
7. Secret name: `vinylverse-db-credentials` (or any name you prefer)
8. Click **"Next"** → **"Next"** → **"Store"**
9. **IMPORTANT:** Copy the **ARN** (looks like: `arn:aws:secretsmanager:us-east-2:123456789:secret:vinylverse-db-credentials-abc123`)
   - You'll need this in Step 3!

### 2.2 Via AWS CLI (Alternative)

```bash
aws secretsmanager create-secret \
  --name vinylverse-db-credentials \
  --secret-string '{"host":"vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com","user":"YOUR_USER","password":"YOUR_PASSWORD","database":"YOUR_DB","port":3306}' \
  --region us-east-2
```

---

## Step 3: Create/Update Lambda Function

### 3.1 Create Lambda Function (If It Doesn't Exist)

**Via AWS Console:**

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click **"Create function"**
3. Choose **"Author from scratch"**
4. Function name: `vinylverse-order-processing` (or your preferred name)
5. Runtime: **Node.js 18.x** (or 20.x)
6. Architecture: **x86_64**
7. Click **"Create function"**

### 3.2 Upload Your Code

**Option A: Via AWS Console**

1. In your Lambda function page, scroll to **"Code source"**
2. Click **"Upload from"** → **".zip file"**
3. Select `order-lambda.zip` (from project root: `../../order-lambda.zip`)
4. Click **"Save"**

**Option B: Via AWS CLI**

```bash
# From project root directory
aws lambda update-function-code \
  --function-name vinylverse-order-processing \
  --zip-file fileb://order-lambda.zip \
  --region us-east-2
```

### 3.3 Configure Environment Variables

1. In Lambda function → **Configuration** tab → **Environment variables**
2. Click **"Edit"**
3. Add environment variable:
   - **Key:** `SECRET_ARN`
   - **Value:** (paste the ARN from Step 2.1)
4. (Optional) Add:
   - **Key:** `AWS_REGION`
   - **Value:** `us-east-2`
5. Click **"Save"**

### 3.4 Configure Lambda Permissions

Lambda needs permission to read Secrets Manager:

1. Go to **Configuration** → **Permissions**
2. Click on the **Execution role** name
3. This opens IAM in a new tab
4. Click **"Add permissions"** → **"Create inline policy"**
5. Click **"JSON"** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-2:*:secret:vinylverse-db-credentials-*"
    }
  ]
}
```

6. Replace the Resource ARN with your actual secret ARN (or use `*` for all secrets)
7. Click **"Review policy"**
8. Name: `SecretsManagerAccess`
9. Click **"Create policy"**

### 3.5 Configure VPC (If RDS is in a VPC)

If your RDS database is in a VPC:

1. **Configuration** → **VPC**
2. Click **"Edit"**
3. Select:
   - **VPC:** (same as your RDS)
   - **Subnets:** (at least 2 subnets)
   - **Security groups:** (must allow outbound to RDS on port 3306)
4. Click **"Save"**

**Note:** If RDS is publicly accessible, you might not need VPC configuration.

---

## Step 4: Set Up API Gateway

### 4.1 Create API Gateway (If Not Exists)

1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
2. Click **"Create API"**
3. Choose **"REST API"** → **"Build"**
4. Protocol: **REST**
5. Create new API: **"New API"**
6. API name: `vinylverse-api` (or your name)
7. Endpoint Type: **Regional**
8. Click **"Create API"**

### 4.2 Create Resources

1. With **"/"** selected, click **"Actions"** → **"Create Resource"**
2. Resource Name: `order-processing`
3. Resource Path: `/order-processing` (auto-filled)
4. Click **"Create Resource"**

5. With **"/order-processing"** selected, click **"Actions"** → **"Create Resource"**
6. Resource Name: `order`
7. Resource Path: `/order` (auto-filled)
8. Click **"Create Resource"**

### 4.3 Create POST Method

1. Select **"/order-processing/order"** resource
2. Click **"Actions"** → **"Create Method"**
3. Select **POST** from dropdown → click checkmark
4. Integration type: **Lambda Function**
5. Check **"Use Lambda Proxy integration"** ✅
6. Lambda Function: `vinylverse-order-processing` (or your function name)
7. Click **"Save"** → **"OK"** (when prompted to give API Gateway permission)

### 4.4 Enable CORS

1. With **POST** method selected, click **"Actions"** → **"Enable CORS"**
2. Keep default settings:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `POST,OPTIONS`
3. Click **"Enable CORS and replace existing CORS headers"**

### 4.5 Deploy API

1. Click **"Actions"** → **"Deploy API"**
2. Deployment stage: **"dev"** (or create new)
3. Deployment description: `Initial deployment`
4. Click **"Deploy"**

### 4.6 Get Your API URL

After deployment, you'll see:
- **Invoke URL:** `https://abc123xyz.execute-api.us-east-2.amazonaws.com/dev`

**Save this URL!** Your endpoint will be:
`https://abc123xyz.execute-api.us-east-2.amazonaws.com/dev/order-processing/order`

---

## Step 5: Test Your Deployment

### 5.1 Test via AWS Lambda Console

1. Go to Lambda function
2. Click **"Test"** tab
3. Create new test event:

```json
{
  "httpMethod": "POST",
  "body": "{\"items\":[{\"id\":\"1\",\"name\":\"Test Item\",\"price\":24.99,\"qty\":1}],\"customer\":{\"name\":\"Test User\",\"email\":\"test@example.com\"},\"shipping\":{\"address1\":\"123 Test St\",\"city\":\"Columbus\",\"state\":\"OH\",\"country\":\"USA\",\"postalCode\":\"43210\"},\"payment\":{\"cardName\":\"Test User\",\"cardNumber\":\"4111111111111111\",\"expiration\":\"12/25\"},\"total\":24.99}"
}
```

4. Click **"Test"**
5. Check the response - should be `200` or `201` with confirmation ID

### 5.2 Test via API Gateway

1. In API Gateway, select **POST** method
2. Click **"TEST"** button
3. Leave request body empty (or add test JSON)
4. Click **"Test"**
5. Check response

### 5.3 Test via cURL

Replace `YOUR_API_URL` with your actual API Gateway URL:

```bash
curl -X POST https://YOUR_API_URL/dev/order-processing/order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "1", "name": "Pink Floyd - The Dark Side of the Moon", "price": 24.99, "qty": 1}
    ],
    "customer": {"name": "John Doe", "email": "john@example.com"},
    "shipping": {
      "address1": "123 Main St",
      "city": "Columbus",
      "state": "OH",
      "country": "USA",
      "postalCode": "43210"
    },
    "payment": {
      "cardName": "John Doe",
      "cardNumber": "4111111111111111",
      "expiration": "12/25"
    },
    "total": 24.99
  }'
```

**Expected Response:**
```json
{
  "confirmationId": "ORD-1234567890-abc123",
  "orderId": 1,
  "status": "confirmed",
  "message": "Order successfully persisted to database"
}
```

### 5.4 Verify Database

Connect to your database and check:

```sql
SELECT * FROM CUSTOMER_ORDER ORDER BY CREATED_AT DESC LIMIT 5;
```

---

## Troubleshooting

### Error: "SECRET_ARN not set"
- **Fix:** Add `SECRET_ARN` environment variable in Lambda configuration

### Error: "AccessDeniedException" when reading secret
- **Fix:** Add IAM policy to Lambda execution role (Step 3.4)

### Error: "Can't connect to MySQL server"
- **Fix:** 
  - Check security groups allow Lambda to access RDS (port 3306)
  - If RDS is in VPC, configure Lambda VPC (Step 3.5)
  - Verify database credentials in Secrets Manager

### Error: "Table doesn't exist"
- **Fix:** Run `schema.sql` on your database

### Error: "Task timed out"
- **Fix:** Increase Lambda timeout (Configuration → General configuration → Edit → Timeout)

---

## Quick Reference

**Lambda Function Name:** `vinylverse-order-processing`  
**API Gateway URL:** `https://YOUR_API_ID.execute-api.us-east-2.amazonaws.com/dev`  
**Endpoint:** `/order-processing/order`  
**Database:** `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`  
**Region:** `us-east-2`

---

## Next Steps

After successful deployment:
1. Update your frontend `api.js` with the API Gateway URL
2. Test the full order flow from your React app
3. Monitor CloudWatch logs for any errors
4. Set up CloudWatch alarms for production monitoring


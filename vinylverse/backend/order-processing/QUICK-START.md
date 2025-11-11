# Quick Start Guide

## Understanding the Setup

**Your code** (`index.js`) is written **locally** but runs **in AWS Lambda**.

Think of it like this:
- 📝 You write code on your computer
- ☁️ You upload it to AWS Lambda
- 🌐 API Gateway makes it accessible via HTTP
- 💾 Lambda connects to your RDS database

## Step-by-Step Setup

### Step 1: Set Up Database (One Time)

Your database is already in AWS: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`

You need to:
1. Create the tables (run `schema.sql`)
2. Add some test inventory items

**Option A: Using MySQL Command Line**
```bash
mysql -h vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com \
      -u YOUR_USERNAME -p YOUR_DATABASE_NAME < schema.sql
```

**Option B: Using the Setup Script**
```bash
cd backend/order-processing
./setup-database.sh
```

### Step 2: Create AWS Secrets Manager Secret

1. Go to AWS Console → Secrets Manager
2. Click "Store a new secret"
3. Choose "Other type of secret"
4. Select "Plaintext" and paste this JSON (replace with your actual values):

```json
{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "your_db_username",
  "password": "your_db_password",
  "database": "your_database_name",
  "port": 3306
}
```

5. Name it something like `vinylverse-db-credentials`
6. Copy the **ARN** (you'll need it for Lambda)

### Step 3: Deploy Your Lambda Code

**Package your code:**
```bash
cd backend/order-processing
npm install
zip -r ../../order-lambda.zip .
```

**Upload to Lambda:**
1. Go to AWS Console → Lambda
2. Find your order-processing Lambda function
3. Click "Upload from" → ".zip file"
4. Upload `order-lambda.zip`

**OR use AWS CLI:**
```bash
aws lambda update-function-code \
  --function-name your-order-lambda-name \
  --zip-file fileb://order-lambda.zip \
  --region us-east-2
```

### Step 4: Configure Lambda Environment

1. In Lambda function → Configuration → Environment variables
2. Add: `SECRET_ARN` = (the ARN from Secrets Manager)

### Step 5: Connect API Gateway (If Not Already Done)

1. Go to API Gateway
2. Create/select your API
3. Create resource: `/order-processing`
4. Create resource: `/order` (under `/order-processing`)
5. Create method: `POST`
6. Integration type: Lambda Function
7. Select your Lambda function
8. Enable CORS
9. Deploy API

### Step 6: Test It!

**Get your API Gateway URL** (looks like):
`https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev`

**Test with cURL:**
```bash
curl -X POST https://YOUR_API_URL/dev/order-processing/order \
  -H "Content-Type: application/json" \
  -d @test-order.json
```

## Common Questions

### Q: Where does my code run?
**A:** Your code runs in AWS Lambda (in the cloud), but you write it locally.

### Q: Can I test locally?
**A:** Yes! Use `test-db-connection.js` to test the database connection from your computer.

### Q: Where is the database?
**A:** In AWS RDS: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`

### Q: How does Lambda connect to the database?
**A:** Lambda reads credentials from Secrets Manager, then connects to RDS.

### Q: Do I need to change the code?
**A:** No! The code in `index.js` already connects to RDS. Just make sure:
- Secrets Manager has the right credentials
- Lambda has the `SECRET_ARN` environment variable
- Lambda can reach RDS (VPC configuration if needed)

## Troubleshooting

**"Can't connect to database"**
- Check security groups (Lambda needs access to RDS on port 3306)
- Verify Secrets Manager has correct credentials
- Check Lambda is in same VPC as RDS (if RDS is in VPC)

**"SECRET_ARN not set"**
- Add environment variable in Lambda configuration

**"Table doesn't exist"**
- Run `schema.sql` to create tables

## File Locations

- **Your Code**: `backend/order-processing/index.js` (edit this locally)
- **Database Schema**: `backend/order-processing/schema.sql` (run this on RDS)
- **Test Scripts**: `backend/order-processing/test-*.sh` (run locally)
- **Lambda Function**: AWS Console → Lambda (runs in cloud)
- **Database**: AWS RDS (in cloud)


# Architecture Overview

## Where Everything Runs

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL COMPUTER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  backend/order-processing/                              │   │
│  │    ├── index.js          ← YOU WRITE CODE HERE          │   │
│  │    ├── package.json      ← DEPENDENCIES                 │   │
│  │    └── schema.sql        ← DATABASE SCHEMA              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          │ DEPLOY (zip & upload)                │
│                          ▼                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ API Gateway │─────▶│   Lambda     │─────▶│  RDS MySQL   │  │
│  │  (HTTP API) │      │  (Your Code) │      │  (Database)  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│       │                      │                      │            │
│       │                      │                      │            │
│       │              ┌───────┴───────┐              │            │
│       │              │ Secrets Mgr   │              │            │
│       │              │ (DB Creds)   │              │            │
│       │              └──────────────┘              │            │
│       │                                             │            │
│       └─────────────────────────────────────────────┘            │
│                    (All in AWS Cloud)                            │
└─────────────────────────────────────────────────────────────────┘
```

## The Flow

### 1. **You Write Code Locally** (On Your Computer)
   - File: `backend/order-processing/index.js`
   - This is Node.js code that will run in AWS Lambda
   - You write it, test it locally (optional), then deploy it

### 2. **You Deploy to AWS Lambda** (Upload Your Code)
   ```bash
   cd backend/order-processing
   npm install                    # Install dependencies locally
   zip -r ../../order-lambda.zip .  # Package everything
   # Then upload to Lambda via AWS Console or CLI
   ```
   - Your code runs in AWS Lambda (serverless function)
   - Lambda executes your `index.js` when triggered

### 3. **API Gateway Exposes It** (Makes It Accessible via HTTP)
   - API Gateway creates an HTTP endpoint
   - Example: `https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev/order-processing/order`
   - When someone calls this URL, it triggers your Lambda function

### 4. **Lambda Connects to RDS Database** (Runs Your Code)
   - Lambda reads database credentials from AWS Secrets Manager
   - Lambda connects to: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`
   - Lambda executes SQL queries to save orders

## Summary

| Component | Location | What It Is |
|-----------|----------|------------|
| **Your Code** | Local computer | `index.js` - You write this |
| **Lambda Function** | AWS Cloud | Runs your code when triggered |
| **API Gateway** | AWS Cloud | HTTP endpoint that triggers Lambda |
| **RDS Database** | AWS Cloud | MySQL database (stores orders) |
| **Secrets Manager** | AWS Cloud | Stores database password securely |

## Key Points

✅ **Code is written locally** - You edit `index.js` on your computer  
✅ **Code runs in AWS** - Lambda executes your code in the cloud  
✅ **Database is in AWS** - RDS MySQL database in AWS  
✅ **Everything connects** - Lambda → Secrets Manager → RDS  

## Testing Options

### Option 1: Test Locally (Before Deploying)
- Edit `test-db-connection.js` with your DB credentials
- Run: `node test-db-connection.js`
- This tests the database connection from your computer

### Option 2: Test After Deploying to Lambda
- Deploy your code to Lambda
- Test via API Gateway endpoint
- Lambda runs your code and connects to RDS

### Option 3: Test via Frontend
- Your React app calls API Gateway
- API Gateway triggers Lambda
- Lambda saves to RDS

## Deployment Steps

1. **Write code locally** ✅ (You've done this)
2. **Package code**: `zip -r order-lambda.zip .`
3. **Upload to Lambda**: Via AWS Console or CLI
4. **Configure Lambda**:
   - Set `SECRET_ARN` environment variable
   - Configure VPC (if needed)
5. **Connect API Gateway** to Lambda
6. **Test**: Call API Gateway endpoint

## Where to Find Things

- **Your Code**: `backend/order-processing/index.js` (local)
- **Lambda Function**: AWS Console → Lambda
- **API Gateway**: AWS Console → API Gateway
- **Database**: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com` (AWS RDS)
- **Secrets**: AWS Console → Secrets Manager


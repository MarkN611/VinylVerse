# AWS Credentials Setup

## Quick Answer

**Use YOUR AWS credentials** - the AWS account you have access to.

"VinylVerse" is just the **project name** - it's not a separate AWS account.

## What You Need

You need **YOUR AWS account credentials** to:
- Deploy Lambda functions
- Create API Gateway
- Access Secrets Manager
- Connect to RDS database

## Getting Your AWS Credentials

### Option 1: If You Have AWS Account Access

1. **Access Key ID** and **Secret Access Key**:
   - Go to AWS Console → IAM → Users → Your username
   - Security credentials tab → Create access key
   - Download or copy the keys

2. **Configure AWS CLI:**
   ```bash
   aws configure
   ```
   
   Enter:
   - **AWS Access Key ID:** Your access key
   - **AWS Secret Access Key:** Your secret key
   - **Default region:** `us-east-2` (or your region)
   - **Default output format:** `json`

### Option 2: If Using AWS Educate or Class Account

If this is for a class (CSE 5234), you might be using:
- **AWS Educate account** - Use those credentials
- **Shared class account** - Use the credentials provided by your instructor
- **Your personal AWS account** - Use your own credentials

### Option 3: If You Don't Have AWS Account

1. **Create AWS Free Tier Account:**
   - Go to https://aws.amazon.com/
   - Sign up for free tier (12 months free)
   - You'll get $200 credit for students

2. **Or use AWS Educate:**
   - Go to https://awseducate.com/
   - Sign up with your student email
   - Get free AWS credits

## What "VinylVerse" Means

- **VinylVerse** = Your project name (like "my-ecommerce-app")
- **NOT** = A separate AWS account
- It's just used in:
  - Database name: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`
  - Lambda function name: `vinylverse-order-processing` (you can name it anything)
  - API name: `vinylverse-api` (you can name it anything)

## Important Notes

✅ **Use YOUR credentials** - The AWS account you control  
✅ **"VinylVerse" is just naming** - It's your project, name things however you want  
✅ **Database is in YOUR AWS account** - `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com` is in your account  
✅ **All resources are in YOUR account** - Lambda, API Gateway, RDS, Secrets Manager  

## Quick Setup

```bash
aws configure
```

Enter:
- **Access Key ID:** `YOUR_ACCESS_KEY`
- **Secret Access Key:** `YOUR_SECRET_KEY`
- **Region:** `us-east-2`
- **Output format:** `json`

Then test:
```bash
aws sts get-caller-identity
```

This shows which AWS account you're using.

## For Class Projects

If this is for **CSE 5234**, check with your instructor:
- Do you use AWS Educate?
- Do you use a shared class account?
- Or your own AWS account?

Use whatever credentials your instructor provides or your own account.


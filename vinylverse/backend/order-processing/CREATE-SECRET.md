# How to Create Secrets Manager Secret

## Step-by-Step Instructions

### Step 1: Go to Secrets Manager

1. In AWS Console, click the **search bar** at the top
2. Type: `Secrets Manager`
3. Click on **"Secrets Manager"** service

### Step 2: Create New Secret

1. Click the orange button: **"Store a new secret"**

### Step 3: Choose Secret Type

1. Select: **"Other type of secret"**
2. You'll see options like "Credentials for RDS database", "Credentials for other database", etc.
3. Click on **"Other type of secret"** (the generic option)

### Step 4: Enter Secret Value

1. You'll see a text area or JSON editor
2. Click the **"Plaintext"** tab (not "JSON")
3. Paste this JSON (replace with YOUR actual database credentials):

```json
{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "YOUR_DATABASE_USERNAME",
  "password": "YOUR_DATABASE_PASSWORD",
  "database": "YOUR_DATABASE_NAME",
  "port": 3306
}
```

**Replace:**
- `YOUR_DATABASE_USERNAME` = Your MySQL/RDS username (like `admin` or `root`)
- `YOUR_DATABASE_PASSWORD` = Your MySQL/RDS password
- `YOUR_DATABASE_NAME` = Your database name (like `vinylverse` or `vinylverse_db`)

### Step 5: Configure Secret Name

1. Click **"Next"**
2. Secret name: `vinylverse-db-credentials` (or any name you want)
3. Description (optional): `Database credentials for VinylVerse order processing`
4. Click **"Next"**

### Step 6: Configure Rotation (Skip This)

1. Leave rotation **disabled** (default)
2. Click **"Next"**

### Step 7: Review and Store

1. Review your settings
2. Click **"Store"**

### Step 8: Copy the ARN (IMPORTANT!)

After creating the secret:
1. You'll see the secret details page
2. Look for **"ARN"** (Amazon Resource Name)
3. It looks like: `arn:aws:secretsmanager:us-east-2:123456789:secret:vinylverse-db-credentials-abc123`
4. **COPY THIS ARN** - You'll need it for Lambda!

## What You Need Before Creating Secret

You need to know:
- ✅ Database host: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com` (you have this)
- ❓ Database username: `???` (you need this)
- ❓ Database password: `???` (you need this)
- ❓ Database name: `???` (you need this)

## Where to Find Database Credentials

If you don't know your database credentials:

1. **Go to RDS Console:**
   - Search for "RDS" in AWS Console
   - Click on your database: `vinylverse-db`
   - Check the "Connectivity & security" tab
   - Username might be shown there

2. **Or check when you created the database:**
   - You set username/password when creating RDS instance
   - Check your notes or AWS RDS creation history

3. **Or reset the password:**
   - In RDS Console → Your database → Actions → Modify
   - Change master password

## After Creating Secret

Once you have the ARN, go back to Lambda and:
1. Configuration → Environment variables
2. Add: `SECRET_ARN` = (paste the ARN you copied)


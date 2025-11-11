# 🎯 Step-by-Step: Add SECRET_ARN to Lambda RIGHT NOW

## Step 1: Go to Lambda (NOT AppSync!)

1. **Click this link:** https://console.aws.amazon.com/lambda/home?region=us-east-2#/functions
   
   OR
   
2. In AWS Console:
   - Click the **search bar** at the top
   - Type: `Lambda`
   - Click **"Lambda"** service

## Step 2: Find Your Function

Look for a function named:
- `VinylVerse-orderprocessing` (you just updated this!)
- `vinylverse-order-processing`
- `order-processing`
- Or any function with "order" in the name

**Click on the function name** to open it.

## Step 3: Add Environment Variable

1. In your Lambda function page, look at the tabs at the top:
   - Code | Test | Monitor | Configuration | Aliases | Versions
   
2. Click **"Configuration"** tab

3. In the left sidebar, click **"Environment variables"**

4. Click the **"Edit"** button (top right)

5. Click **"Add environment variable"**

6. Fill in:
   - **Key:** `SECRET_ARN`
   - **Value:** `arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE`

7. Click **"Save"** button

## Step 4: Verify It's There

After saving, you should see:
```
SECRET_ARN = arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE
```

## ✅ That's It!

Once you add this, your Lambda can read the database credentials and persist orders!

## Visual Guide

```
AWS Console
  └─> Search: "Lambda"
      └─> Click Lambda service
          └─> Find: "VinylVerse-orderprocessing"
              └─> Click function name
                  └─> Click "Configuration" tab
                      └─> Click "Environment variables" (left sidebar)
                          └─> Click "Edit"
                              └─> Click "Add environment variable"
                                  └─> Key: SECRET_ARN
                                      Value: arn:aws:secretsmanager:us-east-2:439110395438:secret:vinylverse-db-credentials-sAxcTE
                                          └─> Click "Save"
```

## Quick Links

- **Lambda Console:** https://console.aws.amazon.com/lambda/home?region=us-east-2#/functions
- **Your function:** Look for `VinylVerse-orderprocessing`


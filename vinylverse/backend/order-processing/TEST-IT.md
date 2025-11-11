# 🧪 Test Your Order Processing Lambda

## ✅ What You've Done

- [x] Database set up: `VinylVerseDB`
- [x] Secrets Manager secret created
- [x] SECRET_ARN added to Lambda
- [x] Lambda function ready

## 🧪 Now Let's Test It!

### Option 1: Test in Lambda Console (Easiest)

1. **Go to Lambda Console:**
   - https://console.aws.amazon.com/lambda/
   - Find `VinylVerse-orderprocessing`
   - Click on it

2. **Create Test Event:**
   - Click **"Test"** tab (at the top)
   - Click **"Create new event"** or **"New event"**
   - Event name: `test-order`
   - Event JSON: Paste this:

```json
{
  "httpMethod": "POST",
  "body": "{\"items\":[{\"id\":1001,\"name\":\"Dark Side of the Moon\",\"price\":34.99,\"qty\":1}],\"customer\":{\"name\":\"Test User\",\"email\":\"test@example.com\"},\"shipping\":{\"address1\":\"123 Test St\",\"city\":\"Columbus\",\"state\":\"OH\",\"country\":\"USA\",\"postalCode\":\"43210\"},\"payment\":{\"cardName\":\"Test User\",\"cardNumber\":\"4111111111111111\",\"expiration\":\"12/25\"},\"total\":34.99}"
}
```

3. **Run Test:**
   - Click **"Test"** button
   - Wait for execution to complete

4. **Check Response:**
   - Look for `statusCode: 201`
   - Response body should have:
     ```json
     {
       "confirmationId": "ORD-...",
       "orderId": 6,
       "status": "confirmed",
       "message": "Order successfully persisted to database"
     }
     ```

### Option 2: Test via API Gateway

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

### Option 3: Test via Frontend

If your React app is connected:
1. Start your app: `npm start`
2. Go through the purchase flow
3. Submit an order
4. Check for confirmation ID

## ✅ Verify Order in Database

After a successful test, verify the order was saved:

```bash
cd backend/order-processing
node verify-setup.js
```

Or check directly:

```bash
cd backend/order-processing
node -e "
const mysql = require('mysql2/promise');
const conn = await mysql.createConnection({
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
});
const [orders] = await conn.query('SELECT * FROM CUSTOMER_ORDER ORDER BY CREATED_AT DESC LIMIT 1');
console.log('Latest order:', JSON.stringify(orders[0], null, 2));
await conn.end();
"
```

## 🎯 Expected Results

### ✅ Success Response:
- Status code: `201`
- Confirmation ID: `ORD-{timestamp}-{hex}`
- Order ID: A number (6, 7, 8, etc.)
- Message: "Order successfully persisted to database"

### ❌ Common Errors:

**"SECRET_ARN not set"**
- Go back to Lambda → Environment variables
- Make sure `SECRET_ARN` is there

**"AccessDeniedException"**
- Lambda needs `secretsmanager:GetSecretValue` permission
- Check IAM role (see FINAL-CHECKLIST.md)

**"Unknown database"**
- Check secret has `"database": "VinylVerseDB"` (capital V, D, B)

**"Can't connect to MySQL"**
- Check Lambda VPC settings (if RDS is in VPC)
- Verify security group allows Lambda → RDS (port 3306)

## 🎉 Success!

If you get a `201` response with a `confirmationId`, **Lab 8 Objective 5 is COMPLETE!** 🎉

Your orders are now being persisted to the database!


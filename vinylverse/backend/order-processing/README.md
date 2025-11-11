Order Processing Lambda
=======================

**Lab 8 Objective 5: Refactor order management microservice to persist customer order into the database**

This folder contains a Node.js Lambda that accepts a POST order and persists it to a MySQL-compatible database (RDS). It expects a Secrets Manager secret with DB credentials and will run a single SQL transaction to insert shipping, payment (masked), order, line items and decrement inventory.

## Database Persistence

The microservice persists customer orders to a MySQL database with the following tables:
- `SHIPPING_INFO` - Stores shipping address information
- `PAYMENT_INFO` - Stores masked payment information (card number masked, only last 4 digits)
- `CUSTOMER_ORDER` - Main order table linking customer, shipping, and payment
- `CUSTOMER_ORDER_LINE_ITEM` - Individual items within an order
- `ITEM` - Inventory items (referenced, updated when order is placed)

All database operations are performed within a single transaction to ensure data consistency. If any step fails, the entire transaction is rolled back.

Files:
- `index.js` - Lambda handler with database persistence logic
- `package.json` - dependency manifest (mysql2)
- `schema.sql` - Database schema definition for all tables

Setup & deploy
--------------

1. Create a secret in Secrets Manager containing a JSON object with keys: `host`, `user`, `password`, `database`, `port`.

2. Package the lambda and dependencies:

```bash
cd backend/order-processing
npm install
zip -r ../../order-lambda.zip .
```

3. Upload to your Lambda function (replace function name):

```bash
aws lambda update-function-code --function-name your-order-lambda-name --zip-file fileb://order-lambda.zip --region us-east-2
```

4. Set environment variable `SECRET_ARN` on the Lambda to the ARN of the secret you created.

5. If RDS/MySQL is in a VPC, configure the Lambda to run in the same VPC/subnets and assign a security group that can access RDS (port 3306). Also ensure Lambda has network access to Secrets Manager (NAT or VPC endpoint).

Testing
-------

**See [TESTING.md](./TESTING.md) for comprehensive testing instructions.**

Quick test using cURL:

```bash
curl -X POST https://YOUR_API_GATEWAY_URL/dev/order-processing/order \
  -H "Content-Type: application/json" \
  -d @test-order.json
```

Or use the automated test script:

```bash
./test-order.sh [YOUR_API_GATEWAY_URL]
```

The handler returns:
- `201` with `{ confirmationId, orderId, status, message }` on success
- `409` with `{ error: 'insufficient_inventory', details: [...] }` if inventory is insufficient
- `400` with `{ error: 'Invalid order: items required' }` for invalid requests

Security
--------
- Do not store CVV. The handler only stores masked card number + last4. Use a payment provider for production.
- Use least-privilege IAM for the Lambda role (only `secretsmanager:GetSecretValue`).

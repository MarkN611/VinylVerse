# Testing Guide for Order Processing Microservice

This guide covers multiple ways to test the order-processing microservice that persists orders to the database.

## Prerequisites

1. **Database Setup**: Ensure your MySQL database is set up with the schema from `schema.sql`
   - Database Host: `vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com`
   - Run `./setup-database.sh` to set up the schema
2. **AWS Lambda Deployed**: The Lambda function should be deployed and configured
3. **API Gateway**: The endpoint should be accessible
4. **Secrets Manager**: Database credentials should be stored in AWS Secrets Manager
   - Secret should contain: `{ "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com", "user": "...", "password": "...", "database": "...", "port": 3306 }`

## Method 1: Testing via API Gateway (Recommended)

### Using cURL

Replace `YOUR_API_GATEWAY_URL` with your actual API Gateway endpoint URL.

```bash
curl -X POST https://YOUR_API_GATEWAY_URL/dev/order-processing/order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "1",
        "name": "Pink Floyd - The Dark Side of the Moon",
        "price": 24.99,
        "qty": 2
      },
      {
        "id": "2",
        "name": "The Beatles - Abbey Road",
        "price": 22.99,
        "qty": 1
      }
    ],
    "customer": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "shipping": {
      "address1": "123 Main Street",
      "address2": "Apt 4B",
      "city": "Columbus",
      "state": "OH",
      "country": "USA",
      "postalCode": "43210",
      "email": "john.doe@example.com"
    },
    "payment": {
      "cardName": "John Doe",
      "cardNumber": "4111111111111111",
      "expiration": "12/25"
    },
    "total": 72.97
  }'
```

### Expected Success Response (201)

```json
{
  "confirmationId": "ORD-1234567890-abc123",
  "orderId": 1,
  "status": "confirmed",
  "message": "Order successfully persisted to database"
}
```

### Expected Error Response (409 - Insufficient Inventory)

```json
{
  "error": "insufficient_inventory",
  "details": [
    {
      "id": "1",
      "name": "Pink Floyd - The Dark Side of the Moon",
      "requested": 100,
      "available": 10
    }
  ]
}
```

## Method 2: Testing via AWS Lambda Console

1. Go to AWS Lambda Console
2. Select your order-processing Lambda function
3. Click on "Test" tab
4. Create a new test event with this JSON:

```json
{
  "httpMethod": "POST",
  "body": "{\"items\":[{\"id\":\"1\",\"name\":\"Pink Floyd - The Dark Side of the Moon\",\"price\":24.99,\"qty\":2}],\"customer\":{\"name\":\"John Doe\",\"email\":\"john.doe@example.com\"},\"shipping\":{\"address1\":\"123 Main St\",\"city\":\"Columbus\",\"state\":\"OH\",\"country\":\"USA\",\"postalCode\":\"43210\"},\"payment\":{\"cardName\":\"John Doe\",\"cardNumber\":\"4111111111111111\",\"expiration\":\"12/25\"},\"total\":49.98}"
}
```

5. Click "Test" and review the response

## Method 3: Testing via Postman

1. Create a new POST request
2. URL: `https://YOUR_API_GATEWAY_URL/dev/order-processing/order`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "items": [
    {
      "id": "1",
      "name": "Pink Floyd - The Dark Side of the Moon",
      "price": 24.99,
      "qty": 2
    }
  ],
  "customer": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  },
  "shipping": {
    "address1": "456 Oak Avenue",
    "city": "Columbus",
    "state": "OH",
    "country": "USA",
    "postalCode": "43215"
  },
  "payment": {
    "cardName": "Jane Smith",
    "cardNumber": "5555555555554444",
    "expiration": "06/26"
  },
  "total": 49.98
}
```

5. Send the request and check the response

## Method 4: Testing via Frontend Application

1. Start your React application: `npm start`
2. Navigate through the purchase flow:
   - Select products and quantities
   - Enter payment information
   - Enter shipping information
   - Review order
   - Confirm order
3. Check the browser console for API responses
4. Verify the confirmation page shows the confirmation ID

## Method 5: Testing Database Persistence

After submitting an order, verify the data was persisted:

### Connect to MySQL Database

```bash
mysql -h vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com -u YOUR_DB_USER -p YOUR_DATABASE
```

Or use the provided SQL file:

```bash
mysql -h vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com -u YOUR_DB_USER -p YOUR_DATABASE < check-db.sql
```

### Test Database Connection

Before testing orders, verify your database connection:

```bash
cd backend/order-processing
node test-db-connection.js
```

Make sure to update the credentials in `test-db-connection.js` first!

### Check Order Was Created

```sql
SELECT * FROM CUSTOMER_ORDER ORDER BY CREATED_AT DESC LIMIT 5;
```

### Check Shipping Info

```sql
SELECT * FROM SHIPPING_INFO ORDER BY ID DESC LIMIT 5;
```

### Check Payment Info (Masked)

```sql
SELECT * FROM PAYMENT_INFO ORDER BY ID DESC LIMIT 5;
```

### Check Line Items

```sql
SELECT * FROM CUSTOMER_ORDER_LINE_ITEM ORDER BY ID DESC LIMIT 10;
```

### Check Inventory Was Updated

```sql
SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY FROM ITEM;
```

### Full Order Details Query

```sql
SELECT 
    o.ID as order_id,
    o.CONFIRMATION_ID,
    o.CUSTOMER_NAME,
    o.CUSTOMER_EMAIL,
    o.TOTAL,
    o.CREATED_AT,
    s.ADDRESS1,
    s.CITY,
    s.STATE,
    s.POSTAL_CODE,
    p.HOLDER_NAME,
    p.CARD_NUM,
    p.EXP_DATE,
    COUNT(li.ID) as item_count
FROM CUSTOMER_ORDER o
JOIN SHIPPING_INFO s ON o.SHIPPING_INFO_ID_FK = s.ID
JOIN PAYMENT_INFO p ON o.PAYMENT_INFO_ID_FK = p.ID
LEFT JOIN CUSTOMER_ORDER_LINE_ITEM li ON o.ID = li.CUSTOMER_ORDER_ID_FK
GROUP BY o.ID
ORDER BY o.CREATED_AT DESC
LIMIT 5;
```

## Test Scenarios

### Scenario 1: Successful Order
- **Items**: Valid items with sufficient inventory
- **Expected**: 201 status, confirmation ID returned
- **Verify**: All tables have new records, inventory decremented

### Scenario 2: Insufficient Inventory
- **Items**: Request quantity > available quantity
- **Expected**: 409 status, error details returned
- **Verify**: No database changes (transaction rolled back)

### Scenario 3: Missing Required Fields
- **Items**: Empty items array
- **Expected**: 400 status, error message
- **Verify**: No database changes

### Scenario 4: Invalid Item ID
- **Items**: Item ID that doesn't exist in database
- **Expected**: 409 status (treated as 0 available)
- **Verify**: Transaction rolled back

### Scenario 5: Payment Card Masking
- **Payment**: Card number "4111111111111111"
- **Expected**: Stored as "**** **** **** 1111"
- **Verify**: Check PAYMENT_INFO table

## Troubleshooting

### Error: "SECRET_ARN not set"
- **Solution**: Set the `SECRET_ARN` environment variable in Lambda configuration

### Error: "Secret not found or empty"
- **Solution**: Verify the secret exists in Secrets Manager and Lambda has permissions

### Error: "Connection refused" or "Can't connect to MySQL server"
- **Solution**: 
  - Check Lambda is in same VPC as RDS (if applicable)
  - Verify security groups allow Lambda to access RDS (port 3306)
  - Check RDS endpoint and credentials

### Error: "Table doesn't exist"
- **Solution**: Run the `schema.sql` file to create all required tables

### Error: "Foreign key constraint fails"
- **Solution**: Ensure ITEM table has the items you're trying to order

## Sample Test Data

Before testing, ensure your ITEM table has some inventory:

```sql
INSERT INTO ITEM (ITEM_NUMBER, NAME, DESCRIPTION, PRICE, AVAILABLE_QUANTITY) VALUES
('1', 'Pink Floyd - The Dark Side of the Moon', 'Original 1973 pressing', 24.99, 10),
('2', 'The Beatles - Abbey Road', 'Anniversary Edition LP', 22.99, 15),
('3', 'Prince - Purple Rain', 'Limited Edition 40th Anniversary', 29.99, 8),
('4', 'Michael Jackson - Thriller', '25th Anniversary Edition', 19.99, 12);
```

## Automated Testing Script

Create a test script `test-order.sh`:

```bash
#!/bin/bash

API_URL="https://YOUR_API_GATEWAY_URL/dev/order-processing/order"

echo "Testing Order Processing API..."
echo "================================"

# Test 1: Valid order
echo -e "\n1. Testing valid order..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "1", "name": "Test Item", "price": 24.99, "qty": 1}],
    "customer": {"name": "Test User", "email": "test@example.com"},
    "shipping": {"address1": "123 Test St", "city": "Columbus", "state": "OH", "country": "USA", "postalCode": "43210"},
    "payment": {"cardName": "Test User", "cardNumber": "4111111111111111", "expiration": "12/25"},
    "total": 24.99
  }' | jq .

# Test 2: Insufficient inventory
echo -e "\n2. Testing insufficient inventory..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "1", "name": "Test Item", "price": 24.99, "qty": 999}],
    "customer": {"name": "Test User", "email": "test@example.com"},
    "shipping": {"address1": "123 Test St", "city": "Columbus", "state": "OH", "country": "USA", "postalCode": "43210"},
    "payment": {"cardName": "Test User", "cardNumber": "4111111111111111", "expiration": "12/25"},
    "total": 24990.01
  }' | jq .

# Test 3: Missing items
echo -e "\n3. Testing missing items..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name": "Test User", "email": "test@example.com"}
  }' | jq .

echo -e "\nTesting complete!"
```

Make it executable: `chmod +x test-order.sh`


# How to Verify Lab 8 Objective 5 Works

## ✅ Quick Answer

**Yes, check the database!** That's the best way to verify orders are being persisted.

## 🎯 Lab 8 Objective 5

**Objective:** "Refactor order management microservice to persist customer order into the database"

**What to verify:**
- ✅ Orders are saved to `CUSTOMER_ORDER` table
- ✅ Line items are saved to `CUSTOMER_ORDER_LINE_ITEM` table
- ✅ Shipping info is saved to `SHIPPING_INFO` table
- ✅ Payment info is saved to `PAYMENT_INFO` table (masked)
- ✅ Inventory is updated in `ITEM` table

## 🔍 Method 1: Use the Verification Script (Easiest)

```bash
cd backend/order-processing
node verify-lab5.js
```

This will show you:
- Total orders in database
- Recent orders with details
- Line items for each order
- Shipping addresses
- Payment info (masked)
- Inventory status

## 🔍 Method 2: Check Database Directly

### Connect to Database

```bash
mysql -h vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com \
      -u admin -p VinylVerseDB
```

Password: `VinylVerse`

### Check Orders

```sql
-- Count total orders
SELECT COUNT(*) as total_orders FROM CUSTOMER_ORDER;

-- See recent orders
SELECT * FROM CUSTOMER_ORDER ORDER BY ID DESC LIMIT 5;

-- See order with all details
SELECT 
    o.ID,
    o.CUSTOMER_NAME,
    o.CUSTOMER_EMAIL,
    o.STATUS,
    s.ADDRESS1,
    s.CITY,
    s.STATE,
    s.POSTAL_CODE,
    p.CARD_NUM,
    p.HOLDER_NAME
FROM CUSTOMER_ORDER o
JOIN SHIPPING_INFO s ON o.SHIPPING_INFO_ID_FK = s.ID
JOIN PAYMENT_INFO p ON o.PAYMENT_INFO_ID_FK = p.ID
ORDER BY o.ID DESC
LIMIT 1;
```

### Check Line Items

```sql
-- See line items for latest order
SELECT * FROM CUSTOMER_ORDER_LINE_ITEM 
ORDER BY ID DESC 
LIMIT 10;
```

### Check Inventory

```sql
-- See if inventory was updated
SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY 
FROM ITEM;
```

## 🔍 Method 3: Test End-to-End

1. **Place an order through your website:**
   - Go to purchase page
   - Select items
   - Enter payment
   - Enter shipping
   - Confirm order

2. **Check the database:**
   ```bash
   node verify-lab5.js
   ```

3. **Verify:**
   - New order appears in `CUSTOMER_ORDER`
   - Line items appear in `CUSTOMER_ORDER_LINE_ITEM`
   - Shipping address is saved
   - Payment is saved (masked)
   - Inventory quantity decreased

## ✅ Success Criteria

Lab 8 Objective 5 is working if:

- ✅ **Orders exist in database** - `CUSTOMER_ORDER` table has records
- ✅ **Line items are saved** - `CUSTOMER_ORDER_LINE_ITEM` has records
- ✅ **Shipping is saved** - `SHIPPING_INFO` has records
- ✅ **Payment is saved** - `PAYMENT_INFO` has records (card numbers masked)
- ✅ **Inventory updated** - `ITEM.AVAILABLE_QUANTITY` decreases after orders
- ✅ **Orders persist** - New orders appear in database after placing them

## 🎯 Quick Test

1. **Place a test order** through your website
2. **Run verification:**
   ```bash
   cd backend/order-processing
   node verify-lab5.js
   ```
3. **Check output** - Should show your new order!

## 📝 What You Should See

When you run `verify-lab5.js`, you should see:

```
✅ Connected to database: VinylVerseDB
Total orders in database: 6 (or more)
Recent orders:
  1. Order ID: 6
     Customer: Test User
     Email: test@example.com
     Status: CONFIRMED
...
✅ Lab 8 Objective 5: VERIFIED!
```

If you see orders in the database, **Lab 8 Objective 5 is working!** 🎉


-- Quick SQL queries to check database status
-- Run these queries to verify your database setup

-- 1. Check if all required tables exist
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM')
ORDER BY TABLE_NAME;

-- 2. Check inventory items
SELECT ITEM_NUMBER, NAME, PRICE, AVAILABLE_QUANTITY 
FROM ITEM 
ORDER BY ITEM_NUMBER;

-- 3. Count items in inventory
SELECT COUNT(*) as total_items, SUM(AVAILABLE_QUANTITY) as total_quantity 
FROM ITEM;

-- 4. Check recent orders
SELECT 
    o.ID,
    o.CONFIRMATION_ID,
    o.CUSTOMER_NAME,
    o.CUSTOMER_EMAIL,
    o.TOTAL,
    o.CREATED_AT,
    COUNT(li.ID) as item_count
FROM CUSTOMER_ORDER o
LEFT JOIN CUSTOMER_ORDER_LINE_ITEM li ON o.ID = li.CUSTOMER_ORDER_ID_FK
GROUP BY o.ID
ORDER BY o.CREATED_AT DESC
LIMIT 10;

-- 5. Check order details with shipping and payment
SELECT 
    o.CONFIRMATION_ID,
    o.CUSTOMER_NAME,
    o.TOTAL,
    s.ADDRESS1,
    s.CITY,
    s.STATE,
    s.POSTAL_CODE,
    p.CARD_NUM,
    p.EXP_DATE,
    o.CREATED_AT
FROM CUSTOMER_ORDER o
JOIN SHIPPING_INFO s ON o.SHIPPING_INFO_ID_FK = s.ID
JOIN PAYMENT_INFO p ON o.PAYMENT_INFO_ID_FK = p.ID
ORDER BY o.CREATED_AT DESC
LIMIT 5;

-- 6. Check order line items for a specific order
SELECT 
    li.ITEM_NUMBER,
    li.ITEM_NAME,
    li.QUANTITY,
    li.UNIT_PRICE,
    (li.QUANTITY * li.UNIT_PRICE) as line_total
FROM CUSTOMER_ORDER_LINE_ITEM li
JOIN CUSTOMER_ORDER o ON li.CUSTOMER_ORDER_ID_FK = o.ID
WHERE o.CONFIRMATION_ID = 'ORD-1234567890-abc123'  -- Replace with actual confirmation ID
ORDER BY li.ID;

-- 7. Verify inventory was updated after orders
SELECT 
    i.ITEM_NUMBER,
    i.NAME,
    i.AVAILABLE_QUANTITY,
    COALESCE(SUM(li.QUANTITY), 0) as total_ordered
FROM ITEM i
LEFT JOIN CUSTOMER_ORDER_LINE_ITEM li ON i.ITEM_NUMBER = li.ITEM_NUMBER
GROUP BY i.ITEM_NUMBER, i.NAME, i.AVAILABLE_QUANTITY
ORDER BY i.ITEM_NUMBER;


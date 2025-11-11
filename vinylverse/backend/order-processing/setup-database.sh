#!/bin/bash

# Database setup script for VinylVerse Order Processing
# This script helps you set up the database schema and test data

DB_HOST="vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com"
DB_USER="${DB_USER:-admin}"  # Change this to your database username
DB_NAME="${DB_NAME:-vinylverse}"  # Change this to your database name

echo "=========================================="
echo "VinylVerse Database Setup"
echo "=========================================="
echo ""
echo "Database Host: $DB_HOST"
echo "Database User: $DB_USER"
echo "Database Name: $DB_NAME"
echo ""
read -sp "Enter database password: " DB_PASS
echo ""

# Test connection
echo "Testing database connection..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "✗ Connection failed! Please check your credentials."
    exit 1
fi

echo "✓ Connection successful!"
echo ""

# Create schema
echo "Creating database schema..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Schema created successfully!"
else
    echo "✗ Schema creation failed!"
    exit 1
fi

echo ""

# Ask if user wants to insert sample data
read -p "Insert sample inventory data? (y/n): " INSERT_DATA

if [ "$INSERT_DATA" = "y" ] || [ "$INSERT_DATA" = "Y" ]; then
    echo "Inserting sample data..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" << EOF
INSERT INTO ITEM (ITEM_NUMBER, NAME, DESCRIPTION, PRICE, AVAILABLE_QUANTITY) VALUES
('1', 'Pink Floyd - The Dark Side of the Moon', 'Original 1973 pressing', 24.99, 10),
('2', 'The Beatles - Abbey Road', 'Anniversary Edition LP', 22.99, 15),
('3', 'Prince - Purple Rain', 'Limited Edition 40th Anniversary', 29.99, 8),
('4', 'Michael Jackson - Thriller', '25th Anniversary Edition', 19.99, 12)
ON DUPLICATE KEY UPDATE 
    NAME = VALUES(NAME),
    DESCRIPTION = VALUES(DESCRIPTION),
    PRICE = VALUES(PRICE),
    AVAILABLE_QUANTITY = VALUES(AVAILABLE_QUANTITY);
EOF
    
    if [ $? -eq 0 ]; then
        echo "✓ Sample data inserted successfully!"
    else
        echo "✗ Sample data insertion failed!"
    fi
fi

echo ""
echo "=========================================="
echo "Database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Create AWS Secrets Manager secret with database credentials"
echo "2. Update Lambda environment variable SECRET_ARN"
echo "3. Test the order processing API"
echo ""


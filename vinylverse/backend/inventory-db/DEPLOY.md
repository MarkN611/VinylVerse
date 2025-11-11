# Deploy inventory-db Lambda

This Lambda exposes DB-backed inventory in the UI-expected shape:

[
  { "id": "v1", "name": "Random Access Memories", "price": 27.99, "qty": 3 },
  { "id": "v2", "name": "To Pimp a Butterfly", "price": 29.99, "qty": 2 },
  { "id": "v3", "name": "Kind of Blue", "price": 22.50, "qty": 0 }
]

## Prereqs

- Node.js 18.x runtime on AWS Lambda
- An AWS Secrets Manager secret with JSON:
  `{ "host": "...", "username": "...", "password": "...", "dbname": "...", "port": 3306 }`
- IAM permissions on the Lambda role: `secretsmanager:GetSecretValue`

## Build and Package

From this folder:

1. Install deps
   npm install --production

2. Zip for deployment
   zip -r inventory-db.zip index.js node_modules package.json

## Create Lambda

- Name: VinylVerse-inventorydb
- Runtime: Node.js 18.x
- Handler: index.handler
- Upload: inventory-db.zip
- Env vars:
  - SECRET_ARN: `arn:aws:secretsmanager:us-east-2:...:secret:your-secret`
  - AWS_REGION: `us-east-2`
- Role: attach policy with `secretsmanager:GetSecretValue`

## API Gateway

Create a GET route, e.g. `/inventory-db`, pointing to this Lambda.
Enable CORS (allow GET, OPTIONS).

## Test

```sh
curl -s https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/YOUR_STAGE/inventory-db | jq
```

Expect `qty` to match your DB ITEM.AVAILABLE_QUANTITY values.

## Frontend switch

In the `vinylverse` app root, create `.env` (or set env var before build):

```env
REACT_APP_INVENTORY_URL=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/YOUR_STAGE/inventory-db
```

Restart dev server / rebuild, then open the Purchase page. It should reflect DB values.

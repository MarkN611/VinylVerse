// inventory-db/index.js - DB-backed Inventory Lambda (Node 18, CommonJS)
// Returns inventory directly from MySQL ITEM table in the UI-expected shape:
// [{ id: 'v1', name: 'Random Access Memories', price: 27.99, qty: 3 }, ...]
//
// Env:
// - SECRET_ARN: ARN of Secrets Manager secret with JSON { host, username, password, dbname, port }
// - AWS_REGION (optional): defaults to us-east-2

const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || 'us-east-2' });

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Content-Type': 'application/json'
};

let cachedCreds = null;
let pool = null;

async function getDbCredentials(secretArn) {
  if (cachedCreds) return cachedCreds;
  const data = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
  if (!data || !data.SecretString) throw new Error('Secret not found or empty');
  const secret = JSON.parse(data.SecretString);
  cachedCreds = {
    host: secret.host,
    user: secret.username || secret.user,
    password: secret.password,
    database: secret.dbname || secret.database,
    port: secret.port ? parseInt(secret.port, 10) : 3306
  };
  return cachedCreds;
}

async function getPool() {
  if (pool) return pool;
  const secretArn = process.env.SECRET_ARN;
  if (!secretArn) throw new Error('SECRET_ARN not set');
  const creds = await getDbCredentials(secretArn);
  pool = await mysql.createPool({
    host: creds.host,
    user: creds.user,
    password: creds.password,
    database: creds.database,
    port: creds.port,
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
  });
  return pool;
}

function ok(body) {
  return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(body) };
}

function err(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

exports.handler = async (event = {}) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Only support GET for HTTP; allow direct invocation with no method as well
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return err(405, { error: 'method_not_allowed', message: 'Only GET is supported' });
  }

  try {
    const p = await getPool();
    const [rows] = await p.query(
      'SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM ORDER BY ITEM_NUMBER'
    );
    const out = rows.map(r => ({
      id: `v${r.ITEM_NUMBER}`,
      name: r.NAME,
      price: Number(r.UNIT_PRICE ?? 0),
      qty: r.AVAILABLE_QUANTITY
    }));
    return ok(out);
  } catch (e) {
    console.error('inventory-db error:', e);
    return err(500, { error: 'internal_error', message: e.message || String(e) });
  }
};

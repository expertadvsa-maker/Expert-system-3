import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const username = process.env.VITE_ALIPHIA_USERNAME;
const password = process.env.VITE_ALIPHIA_PASSWORD || '';
const apiKey = process.env.VITE_ALIPHIA_API_KEY;

const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

const baseHeaders = {
  'Authorization': `Basic ${basicAuth}`,
  'X-KEYALI-API': apiKey,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function runTest(label, payload) {
  console.log(`\n--- Test: ${label} ---`);
  try {
    const res = await fetch('https://aliphia.com/v1/api_public/quote', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Failed:", error);
  }
}

async function start() {
  const itemsArray = [
    {
      "item_name": "Test Item String",
      "item_price": 50,
      "item_quantity": 2
    }
  ];

  // تجربة 1: تمرير quote_items كـ JSON String
  await runTest(
    "1. quote_items as JSON string",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": JSON.stringify(itemsArray)
      }
    }
  );

  // تجربة 2: تمرير items كـ JSON String
  await runTest(
    "2. items as JSON string",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "items": JSON.stringify(itemsArray)
      }
    }
  );
}

start();

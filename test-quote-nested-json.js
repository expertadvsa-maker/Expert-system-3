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
  // تجربة A: quote_date_created + quote_items + item_name/item_price/item_quantity
  await runTest(
    "Variant A: quote_date_created + quote_items + prefixed item fields",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_name": "Test Item A",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة B: quote_date_created + quote_items + flat item fields (name/price/quantity)
  await runTest(
    "Variant B: quote_date_created + quote_items + flat item fields",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "name": "Test Item B",
            "price": 50,
            "quantity": 2
          }
        ]
      }
    }
  );

  // تجربة C: quote_date_created + items + prefixed item fields
  await runTest(
    "Variant C: quote_date_created + items + prefixed item fields",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "items": [
          {
            "item_name": "Test Item C",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة D: date + quote_items + prefixed item fields
  await runTest(
    "Variant D: date + quote_items + prefixed item fields",
    {
      "quote": {
        "client_id": 2082,
        "date": "2026-06-04",
        "quote_items": [
          {
            "item_name": "Test Item D",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );
}

start();

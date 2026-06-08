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
  // تجربة 1: استخدام item_rate بدلاً من item_price مع quote_items
  await runTest(
    "1. quote_items with item_rate",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_name": "Test Item 1",
            "item_rate": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة 2: استخدام item_lookup_id الخاص بمنتج حقيقي (3)
  await runTest(
    "2. quote_items with real item_lookup_id (3) and item_rate",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": 3,
            "item_name": "توريد وتركيب سور اعلاني ارتفاع  3م",
            "item_rate": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة 3: استخدام items مع item_rate و item_lookup_id
  await runTest(
    "3. items with real item_lookup_id (3) and item_rate",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "items": [
          {
            "item_lookup_id": 3,
            "item_name": "توريد وتركيب سور اعلاني ارتفاع  3م",
            "item_rate": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة 4: استخدام item_lookup_id مع item_price
  await runTest(
    "4. quote_items with real item_lookup_id (3) and item_price",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": 3,
            "item_name": "توريد وتركيب سور اعلاني ارتفاع  3م",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );
}

start();

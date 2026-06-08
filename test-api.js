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

async function runTest(label, url, payload) {
  console.log(`\n--- Test: ${label} ---`);
  
  try {
    const res = await fetch(url, {
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
  // تجربة هيكل JSON متداخل بدون user_id أو group_id
  await runTest(
    "Nested JSON - quote + date + items (No user_id, No group_id)",
    "https://aliphia.com/v1/api_public/quote",
    {
      "quote": {
        "client_id": 2082,
        "date": "2026-06-04",
        "items": [
          {
            "description": "Test Item 1",
            "quantity": 2,
            "price": 50
          }
        ]
      }
    }
  );

  // تجربة هيكل JSON متداخل مع item_name بدلاً من description (No user_id, No group_id)
  await runTest(
    "Nested JSON - quote + items (item_name, item_price, item_quantity)",
    "https://aliphia.com/v1/api_public/quote",
    {
      "quote": {
        "client_id": 2082,
        "date": "2026-06-04",
        "items": [
          {
            "item_name": "Test Item 2",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة هيكل JSON متداخل مع مفتاح quote_items بدلاً من items (No user_id, No group_id)
  await runTest(
    "Nested JSON - quote + quote_items (item_name, item_price, item_quantity)",
    "https://aliphia.com/v1/api_public/quote",
    {
      "quote": {
        "client_id": 2082,
        "date": "2026-06-04",
        "quote_items": [
          {
            "item_name": "Test Item 3",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );
}

start();

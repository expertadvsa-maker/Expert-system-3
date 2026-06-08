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
  'Content-Type': 'application/x-www-form-urlencoded',
};

async function runTest(label, url, params) {
  console.log(`\n--- Test: ${label} ---`);
  const body = new URLSearchParams();
  for (const k in params) {
    body.append(k, params[k]);
  }
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: body.toString(),
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Failed:", error);
  }
}

async function start() {
  // تجربة 1: استخدام quote[items] بدلاً من quote[quote_items]
  await runTest(
    "Urlencoded - quote[items]",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "quote[client_id]": "2082",
      "quote[quote_date_created]": "2026-06-04",
      "quote[user_id]": "1",
      "quote[invoice_group_id]": "1",
      "quote[items][0][item_name]": "Test Item 1",
      "quote[items][0][item_price]": "50",
      "quote[items][0][item_quantity]": "2",
    }
  );

  // تجربة 2: بدون user_id و invoice_group_id مع quote_items
  await runTest(
    "Urlencoded - quote_items (No user_id, No group_id)",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "quote[client_id]": "2082",
      "quote[quote_date_created]": "2026-06-04",
      "quote[quote_items][0][item_name]": "Test Item 2",
      "quote[quote_items][0][item_price]": "100",
      "quote[quote_items][0][item_quantity]": "1",
    }
  );

  // تجربة 3: بدون user_id و invoice_group_id مع items
  await runTest(
    "Urlencoded - items (No user_id, No group_id)",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "quote[client_id]": "2082",
      "quote[quote_date_created]": "2026-06-04",
      "quote[items][0][item_name]": "Test Item 3",
      "quote[items][0][item_price]": "150",
      "quote[items][0][item_quantity]": "1",
    }
  );

  // تجربة 4: استخدام هيكل مسطح تماماً للبنود (Flat URL Encoded)
  await runTest(
    "Flat Urlencoded - No quote prefix",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "client_id": "2082",
      "quote_date_created": "2026-06-04",
      "user_id": "1",
      "invoice_group_id": "1",
      "items[0][item_name]": "Test Item 4",
      "items[0][item_price]": "200",
      "items[0][item_quantity]": "1",
    }
  );
}

start();

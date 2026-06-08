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
  
  console.log("Body string:", body.toString());
  
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
  // تجربة 1: صيغة urlencoded باستخدام quote[date] و quote[quote_items]
  await runTest(
    "Urlencoded - quote[date] & quote[quote_items]",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "quote[client_id]": "2082",
      "quote[date]": "2026-06-04",
      "quote[user_id]": "1",
      "quote[invoice_group_id]": "1",
      "quote[quote_items][0][item_name]": "Test Item A",
      "quote[quote_items][0][item_price]": "50",
      "quote[quote_items][0][item_quantity]": "2",
    }
  );

  // تجربة 2: صيغة urlencoded باستخدام quote[quote_date_created] و quote[quote_items]
  await runTest(
    "Urlencoded - quote[quote_date_created] & quote[quote_items]",
    "https://aliphia.com/v1/api_public/quote/",
    {
      "quote[client_id]": "2082",
      "quote[quote_date_created]": "2026-06-04",
      "quote[user_id]": "1",
      "quote[invoice_group_id]": "1",
      "quote[quote_items][0][item_name]": "Test Item B",
      "quote[quote_items][0][item_price]": "100",
      "quote[quote_items][0][item_quantity]": "1",
    }
  );
}

start();

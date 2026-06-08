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
  // تجربة 1: إرسال item_lookup_id كـ 0 كقيمة افتراضية للبند المخصص
  await runTest(
    "1. item_lookup_id = 0",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": 0,
            "item_name": "Custom Test Item",
            "item_price": 50,
            "item_quantity": 2
          }
        ]
      }
    }
  );

  // تجربة 2: إرسال item_lookup_id كـ 0 وضريبة 1 (15%)
  await runTest(
    "2. item_lookup_id = 0 + tax_rate_id = 1",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": 0,
            "item_name": "Custom Taxed Item",
            "item_price": 50,
            "item_quantity": 2,
            "item_tax_rate_id": 1
          }
        ]
      }
    }
  );

  // تجربة 3: إرسال item_lookup_id لمنتج حقيقي (3) وضريبة 1 (15%)
  await runTest(
    "3. Real item_lookup_id (3) + tax_rate_id = 1",
    {
      "quote": {
        "client_id": 2082,
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": 3,
            "item_name": "توريد وتركيب سور اعلاني ارتفاع  3م",
            "item_price": 50,
            "item_quantity": 2,
            "item_tax_rate_id": 1
          }
        ]
      }
    }
  );

  // تجربة 4: إرسال الحقول كـ strings لجميع القيم داخل البند
  await runTest(
    "4. All fields as strings",
    {
      "quote": {
        "client_id": "2082",
        "quote_date_created": "2026-06-04",
        "quote_items": [
          {
            "item_lookup_id": "0",
            "item_name": "String Item",
            "item_price": "50.00",
            "item_quantity": "2",
            "item_description": "desc"
          }
        ]
      }
    }
  );
}

start();

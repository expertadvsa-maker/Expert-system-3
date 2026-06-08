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

async function testCreateQuote(label, companyId) {
  console.log(`\n--- Test Quote Creation with X-COMALI-ID: ${companyId} (${label}) ---`);
  
  const payload = {
    "quote": {
      "client_id": 2082,
      "quote_date_created": "2026-06-04",
      "quote_items": [
        {
          "item_name": "Test Item with Company Header",
          "item_price": 50,
          "item_quantity": 2
        }
      ]
    }
  };

  try {
    const res = await fetch('https://aliphia.com/v1/api_public/quote', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/json',
        'X-COMALI-ID': String(companyId)
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

async function testCreateClient(label, companyId) {
  console.log(`\n--- Test Client Creation with X-COMALI-ID: ${companyId} (${label}) ---`);
  const payload = {
    "client": {
      "client_name": `Company Test Client ${companyId} ` + Math.floor(Math.random() * 1000)
    }
  };
  try {
    const res = await fetch('https://aliphia.com/v1/api_public/client', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/json',
        'X-COMALI-ID': String(companyId)
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
  // تجربة الشركة 2
  await testCreateClient("Company ID 2", 2);
  await testCreateQuote("Company ID 2", 2);
  
  // تجربة الشركة 1
  await testCreateClient("Company ID 1", 1);
  await testCreateQuote("Company ID 1", 1);
}

start();

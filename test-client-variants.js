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

async function testJSON(label, payload) {
  console.log(`\n--- Test: ${label} ---`);
  try {
    const res = await fetch('https://aliphia.com/v1/api_public/client', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Failed:", error);
  }
}

async function testForm(label, params) {
  console.log(`\n--- Test: ${label} ---`);
  const body = new URLSearchParams();
  for (const k in params) {
    body.append(k, params[k]);
  }
  try {
    const res = await fetch('https://aliphia.com/v1/api_public/client', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Failed:", error);
  }
}

async function start() {
  // تجربة 1: JSON متداخل
  await testJSON("Nested JSON - client", {
    "client": {
      "client_name": "Test Nested JSON Client"
    }
  });

  // تجربة 2: JSON مسطح
  await testJSON("Flat JSON - client_name", {
    "client_name": "Test Flat JSON Client"
  });

  // تجربة 3: Form nested
  await testForm("Form Nested - client[client_name]", {
    "client[client_name]": "Test Form Nested Client"
  });

  // تجربة 4: Form flat
  await testForm("Form Flat - client_name", {
    "client_name": "Test Form Flat Client"
  });
}

start();

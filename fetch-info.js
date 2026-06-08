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

async function testPath(path) {
  const url = `https://aliphia.com/v1/api_public${path}`;
  console.log(`\nTesting GET: ${url}`);
  try {
    const res = await fetch(url, { headers: baseHeaders });
    console.log("Status:", res.status);
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      console.log("Response JSON:", JSON.stringify(parsed, null, 2).substring(0, 1000));
    } catch(e) {
      console.log("Raw response (truncated):", text.substring(0, 300));
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}

async function start() {
  await testPath('/invoice_groups');
  await testPath('/invoice_group');
  await testPath('/invoice/groups');
  await testPath('/taxes');
  await testPath('/tax');
  await testPath('/tax_rates');
}

start();

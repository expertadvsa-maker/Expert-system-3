import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const username = process.env.VITE_ALIPHIA_USERNAME;
const password = process.env.VITE_ALIPHIA_PASSWORD || '';
const apiKey = process.env.VITE_ALIPHIA_API_KEY;

console.log("Credentials loaded:", { username, passwordLength: password.length, apiKey });

if (!username || !apiKey) {
  console.error("Missing credentials in .env.local!");
  process.exit(1);
}

const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
const aliphiaUrl = 'https://aliphia.com/v1/api_public/client/active.json';

const headers = {
  'Authorization': `Basic ${basicAuth}`,
  'X-KEYALI-API': apiKey,
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json',
};

async function test() {
  try {
    const res = await fetch(aliphiaUrl, {
      method: 'GET',
      headers,
    });
    console.log("Status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response body:", text);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

test();

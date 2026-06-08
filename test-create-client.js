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

async function start() {
  const url = 'https://aliphia.com/v1/api_public/client';
  const body = new URLSearchParams();
  body.append('client_name', 'Test API Client ' + Math.floor(Math.random() * 1000));
  body.append('client_email', 'test@example.com');
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: body.toString()
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

start();

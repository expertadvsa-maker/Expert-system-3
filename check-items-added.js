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

async function checkQuote(id) {
  try {
    const res = await fetch(`https://aliphia.com/v1/api_public/quote/${id}`, { headers: baseHeaders });
    const data = await res.json();
    console.log(`\nQuote ${id} Items:`, JSON.stringify(data.response?.quote?.items || [], null, 2));
  } catch (error) {
    console.error(error);
  }
}

async function start() {
  await checkQuote(551);
  await checkQuote(552);
}

start();

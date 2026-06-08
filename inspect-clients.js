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

async function start() {
  try {
    const res = await fetch('https://aliphia.com/v1/api_public/clients/active', {
      headers: baseHeaders
    });
    console.log("Status:", res.status);
    const data = await res.json();
    
    let list = [];
    if (data.response) {
      list = data.response.clients || data.response.client || data.response;
    }
    if (!Array.isArray(list)) {
      list = Object.values(list);
    }
    
    console.log(`Total clients retrieved: ${list.length}`);
    const client2082 = list.find(c => String(c.client_id) === '2082' || String(c.id) === '2082');
    
    if (client2082) {
      console.log("Client 2082 properties:", JSON.stringify(client2082, null, 2));
    } else {
      console.log("Client 2082 NOT found in the active list!");
      console.log("First 3 clients:", JSON.stringify(list.slice(0, 3), null, 2));
    }
  } catch (error) {
    console.error("Failed:", error);
  }
}

start();

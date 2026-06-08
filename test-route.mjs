import fetch from 'node-fetch';
async function test() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/whatsapp/status');
    const txt = await res.text();
    console.log("RESPONSE:", txt.substring(0, 100));
  } catch(e) {
    console.log("ERROR:", e);
  }
}
test();
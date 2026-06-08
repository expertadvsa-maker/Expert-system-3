import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';

async function testBaileys() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info_test');
  
  const initSocket = typeof makeWASocket === 'function' ? makeWASocket : (makeWASocket.default || makeWASocket);
  
  const waSocket = initSocket({
    auth: state,
    printQRInTerminal: true, // test
    browser: ['Test', 'Chrome', '1.0.0']
  });

  waSocket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    console.log('Connection update:', update);
    if (qr) console.log('QR received length:', qr.length);
  });

  waSocket.ev.on('creds.update', saveCreds);

  setTimeout(() => {
    console.log('Timeout. Exiting Test.');
    process.exit(0);
  }, 10000);
}

testBaileys();

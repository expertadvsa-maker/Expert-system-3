import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// تحميل ملف .env.local لكي يتعرف السيرفر على مفاتيح ألف ياء
const require = createRequire(import.meta.url);
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local', override: true });
  dotenv.config({ path: '.env', override: true });
  console.log("🔑 [Aliphia Config] Loaded environment variables:", {
    VITE_ALIPHIA_USERNAME: process.env.VITE_ALIPHIA_USERNAME || 'NOT FOUND',
    VITE_ALIPHIA_API_KEY: process.env.VITE_ALIPHIA_API_KEY ? 'FOUND (length: ' + process.env.VITE_ALIPHIA_API_KEY.length + ')' : 'NOT FOUND',
    VITE_ALIPHIA_PASSWORD: process.env.VITE_ALIPHIA_PASSWORD ? 'FOUND' : 'NOT FOUND'
  });
} catch(e) {
  console.log("ℹ️ [Aliphia Config] dotenv skipped (in production environments, variables should be set in environment directly).");
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import pino from 'pino';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Parse JSON and URL-encoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

let waSocket = null;
let waQrCode = null;
let waStatus = 'disconnected';

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  
  // Handling ESM default export differences
  const initSocket = typeof makeWASocket === 'function' ? makeWASocket : (makeWASocket.default || makeWASocket);
  
  waSocket = initSocket({
    auth: state,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    browser: ['AI Studio Worker', 'Chrome', '1.0.0']
  });

  waSocket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('Received QR from Baileys:', qr);
      try {
        waQrCode = await QRCode.toDataURL(qr);
        waStatus = 'qr';
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('WhatsApp connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      if (shouldReconnect) {
        if (statusCode === DisconnectReason.restartRequired || statusCode === 408 || statusCode === 428) {
             console.log('Restarting or timeout error, retrying connect shortly...');
             setTimeout(connectToWhatsApp, 2000);
        } else {
             setTimeout(connectToWhatsApp, 2000);
        }
      } else {
        waStatus = 'disconnected';
        waSocket = null;
        waQrCode = null;
        // Clean up auth info
        try { fs.rmSync('baileys_auth_info', { recursive: true, force: true }); } catch (e) {}
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened successfully');
      waStatus = 'connected';
      waQrCode = null;
    }
  });

  waSocket.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: waStatus,
    qr: waQrCode
  });
});

app.post('/api/whatsapp/logout', async (req, res) => {
  if (waSocket) {
    await waSocket.logout();
    waStatus = 'disconnected';
    waQrCode = null;
  }
  // Try to remove auth info
  fs.rmSync('baileys_auth_info', { recursive: true, force: true });
  res.json({ success: true });
});

app.post('/api/whatsapp/send', async (req, res) => {
  if (waStatus !== 'connected' || !waSocket) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  const { phone, message } = req.body;
  
  try {
    const formattedPhone = phone.replace(/\D/g, '') + '@s.whatsapp.net';
    await waSocket.sendMessage(formattedPhone, { text: message });
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending message via local Baileys:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

let lastReceivedCreds = null;


// ======================================================
// Aliphia API Proxy - يحل مشكلة CORS في الإنتاج
// يعمل على /api_public/* ويعيد التوجيه لخوادم ألف ياء
// ======================================================
app.all('/api_public/*splat', async (req, res) => {
  let aliphiaPath = req.originalUrl.substring('/api_public'.length);
  const isGuestPath = aliphiaPath.startsWith('/guest/') || aliphiaPath.startsWith('guest/');

  // محاولة القراءة أولاً من الترويسات المرسلة من العميل (الواجهة الأمامية)
  let authHeader = req.headers['authorization'];
  let apiKey = req.headers['x-keyali-api'];

  // إذا لم يرسلها العميل، نستخدم بيئة السيرفر كبديل
  if (!authHeader || !apiKey) {
    const username = process.env.VITE_ALIPHIA_USERNAME;
    const password = process.env.VITE_ALIPHIA_PASSWORD || '';
    const serverApiKey = process.env.VITE_ALIPHIA_API_KEY;

    if (username && serverApiKey) {
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
      authHeader = `Basic ${basicAuth}`;
      apiKey = serverApiKey;
    }
  }

  // حفظ آخر بيانات مستلمة للتشخيص
  lastReceivedCreds = {
    authHeaderReceived: !!req.headers['authorization'],
    apiKeyReceived: !!req.headers['x-keyali-api'],
    finalAuthHeader: authHeader,
    finalApiKey: apiKey,
    // محاولة استخراج الاسم والباسورد لتبسيط الفحص للمستخدم
    decodedUserPass: authHeader && authHeader.startsWith('Basic ') 
      ? Buffer.from(authHeader.substring(6), 'base64').toString('utf8') 
      : 'N/A'
  };

  if (!isGuestPath && (!authHeader || !apiKey)) {
    return res.status(401).json({ error: 'Aliphia credentials not configured on client or server' });
  }

  // بناء الرابط الكامل بطريقة مضمونة ومباشرة مع معلمات الاستعلام
  const aliphiaUrl = isGuestPath 
    ? 'https://aliphia.com/v1' + (aliphiaPath.startsWith('/') ? aliphiaPath : '/' + aliphiaPath)
    : 'https://aliphia.com/v1/api_public' + (aliphiaPath.startsWith('/') ? aliphiaPath : '/' + aliphiaPath);

  const clientContentType = req.headers['content-type'] || '';
  const headers = {
    'Accept': 'application/json, application/pdf, */*',
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  if (authHeader) headers['Authorization'] = authHeader;
  if (apiKey) headers['X-KEYALI-API'] = apiKey;

  let requestBody;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (clientContentType.includes('application/json')) {
      headers['Content-Type'] = 'application/json';
      requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else if (clientContentType.includes('application/x-www-form-urlencoded')) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      requestBody = typeof req.body === 'string' ? req.body : new URLSearchParams(req.body).toString();
    } else {
      headers['Content-Type'] = 'application/json'; // Default fallback
      requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers,
      body: requestBody,
    };

    const aliphiaRes = await fetch(aliphiaUrl, fetchOptions);
    console.log(`📡 [Aliphia Proxy] ${req.method} ${aliphiaUrl} -> Status: ${aliphiaRes.status}`);

    const contentType = aliphiaRes.headers.get('content-type') || '';
    
    // Copy all headers from Aliphia response, rewriting Content-Disposition for guest paths
    for (const [key, value] of aliphiaRes.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'content-disposition' && req.originalUrl.includes('/guest/')) {
        res.setHeader('Content-Disposition', 'inline');
      } else if (lowerKey === 'transfer-encoding' || lowerKey === 'content-encoding') {
        // Skip these to let Express handle them
      } else if (lowerKey === 'www-authenticate') {
        // Skip WWW-Authenticate header to prevent browser login dialog
      } else {
        res.setHeader(key, value);
      }
    }

    res.status(aliphiaRes.status);

    if (contentType.includes('application/json')) {
      res.json(await aliphiaRes.json());
    } else {
      const buffer = await aliphiaRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Aliphia proxy error:', error);
    res.status(500).json({ error: 'Proxy request to Aliphia failed' });
  }
});

// ======================================================
// Diagnostic Route - لفحص أي الحسابات تعمل مع ألف ياء
// ======================================================
app.get('/test-aliphia-connection', async (req, res) => {
  const results = {};

  const testCreds = async (username, password, apiKey, subPath) => {
    if (!username || !apiKey) {
      return { status: 'missing', error: 'Credentials are empty' };
    }
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    try {
      const response = await fetch(`https://aliphia.com/v1/api_public${subPath}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'X-KEYALI-API': apiKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      const text = await response.text();
      let parsed = text;
      try {
        parsed = JSON.parse(text);
      } catch(e) {}

      return {
        pathTested: subPath,
        status: response.status,
        ok: response.ok,
        errorMsg: parsed.error || (response.ok ? null : text.substring(0, 100)),
        dataSample: parsed
      };
    } catch(e) {
      return { status: 'error', error: e.message };
    }
  };

  const oldApiKey = "ali_k0IC7CCdEd6dyIM0cbiyXF9Zo9LKEBAo0KyV";

  const userEnv = process.env.VITE_ALIPHIA_USERNAME || "08818672809340I";
  const passEnv = process.env.VITE_ALIPHIA_PASSWORD || "IXJ52u3I3nNqSf8";

  // فحص مفاتيح .env.local الحالية على المسار الصحيح
  results.activeConnectionTest = await testCreds(
    process.env.VITE_ALIPHIA_USERNAME,
    process.env.VITE_ALIPHIA_PASSWORD || '',
    process.env.VITE_ALIPHIA_API_KEY,
    '/clients/active'
  );

  // إبقاء فحص المسارات كمرجع احتياطي
  results.EnvUser_NewKey_OldPath = await testCreds(process.env.VITE_ALIPHIA_USERNAME, process.env.VITE_ALIPHIA_PASSWORD || '', process.env.VITE_ALIPHIA_API_KEY, '/client/active.json');

  // عرض آخر بيانات تم إرسالها من المتصفح (نافذة الإعدادات)
  results.lastRequestFromBrowser = lastReceivedCreds || "No request received yet since server start";

  res.json(results);
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // تقديم ملفات التطبيق المبني مع إعدادات كاش ذكية لضمان التحديث التلقائي
  app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // معالجة كافة المسارات الأخرى للتوجيه الداخلي (React Router)
  app.get('*all', (req, res) => {
    const ext = path.extname(req.path);
    if (ext && ext !== '.html' && !req.path.endsWith('/')) {
      return res.status(404).send('Asset Not Found');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

} // end startServer

startServer();

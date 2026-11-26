const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const PORT = Number(process.env.PORT) || 4321;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ALBUM_FILE = path.join(DATA_DIR, 'album.json');
const BACKUP_FILE = path.join(DATA_DIR, 'album.backup.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
};

// Ensure data directory and initial physical album.json exist
function ensureInitialData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({ pin: '2511' }, null, 2), 'utf8');
  }
  if (!fs.existsSync(ALBUM_FILE)) {
    const seedPath = path.join(ROOT, 'album-data.js');
    if (fs.existsSync(seedPath)) {
      const code = fs.readFileSync(seedPath, 'utf8');
      const sandbox = { window: {} };
      vm.runInNewContext(code, sandbox);
      if (sandbox.window && sandbox.window.ALBUM_DATA) {
        fs.writeFileSync(ALBUM_FILE, JSON.stringify(sandbox.window.ALBUM_DATA, null, 2), 'utf8');
      }
    }
  }
}

function getExpectedPin() {
  if (process.env.ADMIN_PIN) return String(process.env.ADMIN_PIN).trim();
  try {
    const cfg = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
    return String(cfg.pin || '2511').trim();
  } catch {
    return '2511';
  }
}

function verifyPin(candidate) {
  const expected = Buffer.from(getExpectedPin(), 'utf8');
  const provided = Buffer.from(String(candidate || '').trim(), 'utf8');
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readJsonBody(req, maxBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Calendar day (YYYY-MM-DD) in Argentina, independent of the VPS timezone
const SURPRISE_TIMEZONE = process.env.SURPRISE_TZ || 'America/Argentina/Buenos_Aires';
function todayInSurpriseTimezone(ts) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SURPRISE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(ts));
}

function sanitizeAlbumForPublic(rawAlbum) {
  const now = Date.now();
  const cloned = JSON.parse(JSON.stringify(rawAlbum));
  cloned.serverNow = new Date(now).toISOString();

  // Surprise messages: only today's message ever leaves the server, so it can't be
  // read early (or late) by peeking at the page source or the API response.
  const today = todayInSurpriseTimezone(now);
  const surprises = Array.isArray(cloned.surpriseMessages) ? cloned.surpriseMessages : [];
  cloned.surpriseMessages = surprises
    .filter((m) => m && m.date === today && String(m.message || '').trim())
    .map((m) => ({
      id: String(m.id || m.date),
      date: m.date,
      title: String(m.title || ''),
      message: String(m.message || ''),
      signature: String(m.signature || '')
    }));

  if (Array.isArray(cloned.chapters)) {
    cloned.chapters = cloned.chapters.map((ch) => {
      const unlockTs = ch.unlockAt ? Date.parse(ch.unlockAt) : NaN;
      const isLocked = !Number.isNaN(unlockTs) && now < unlockTs;
      if (!isLocked) {
        return { ...ch, locked: false };
      }
      // Keep only non-spoiler metadata & giftNumber so progress tracker still knows total = 6
      return {
        id: ch.id,
        tabLabel: ch.tabLabel,
        tabColor: ch.tabColor,
        yearLabel: ch.yearLabel,
        shortTitle: ch.shortTitle,
        unlockAt: ch.unlockAt,
        locked: true,
        leftPage: { title: ch.leftPage?.title || ch.tabLabel, story: '', hiddenNotes: [] },
        rightPage: { title: '', story: '', hiddenNotes: [] },
        polaroids: [],
        envelopes: (ch.envelopes || []).map((e) => ({
          id: e.id,
          giftNumber: e.giftNumber,
          resetVersion: e.resetVersion || 0,
          lockedByChapter: true
        })),
        decorations: []
      };
    });
  }
  return cloned;
}

ensureInitialData();

const server = http.createServer(async (req, res) => {
  const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]);

  // ================= API ROUTES =================
  if (cleanUrl === '/api/album' && req.method === 'GET') {
    try {
      const parsed = JSON.parse(fs.readFileSync(ALBUM_FILE, 'utf8'));
      return sendJson(res, 200, sanitizeAlbumForPublic(parsed));
    } catch {
      return sendJson(res, 500, { error: 'No se pudo leer data/album.json' });
    }
  }

  // Full unredacted album for /admin (PIN-protected)
  if (cleanUrl === '/api/admin/album' && req.method === 'GET') {
    const pin = req.headers['x-admin-pin'];
    if (!verifyPin(pin)) {
      return sendJson(res, 401, { ok: false, error: 'PIN inválido o no autorizado' });
    }
    try {
      const raw = fs.readFileSync(ALBUM_FILE, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      return res.end(raw);
    } catch {
      return sendJson(res, 500, { error: 'No se pudo leer data/album.json' });
    }
  }

  if (cleanUrl === '/api/admin/verify' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req, 4096);
      if (!verifyPin(body.pin)) {
        return sendJson(res, 401, { ok: false, error: 'PIN incorrecto' });
      }
      return sendJson(res, 200, { ok: true });
    } catch {
      return sendJson(res, 400, { ok: false, error: 'Solicitud inválida' });
    }
  }

  if (cleanUrl === '/api/album' && req.method === 'PUT') {
    const pin = req.headers['x-admin-pin'];
    if (!verifyPin(pin)) {
      return sendJson(res, 401, { ok: false, error: 'PIN inválido o no autorizado' });
    }
    try {
      const nextData = await readJsonBody(req);
      if (!nextData || !nextData.meta || !Array.isArray(nextData.chapters)) {
        return sendJson(res, 400, { ok: false, error: 'Estructura del álbum inválida' });
      }
      // Backup existing file before atomic replace
      if (fs.existsSync(ALBUM_FILE)) {
        fs.copyFileSync(ALBUM_FILE, BACKUP_FILE);
      }
      const tmpFile = ALBUM_FILE + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(nextData, null, 2), 'utf8');
      fs.renameSync(tmpFile, ALBUM_FILE);
      return sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message || 'Error guardando datos' });
    }
  }

  // Upload photo / video / audio directly into media/<folder>/ (PIN-protected, zero dependencies)
  if (cleanUrl === '/api/upload' && req.method === 'POST') {
    const pin = req.headers['x-admin-pin'];
    if (!verifyPin(pin)) {
      return sendJson(res, 401, { ok: false, error: 'PIN inválido o no autorizado' });
    }

    const rawFolder = String(req.headers['x-upload-folder'] || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
    const folder = rawFolder || 'general';
    const rawName = decodeURIComponent(String(req.headers['x-file-name'] || 'archivo.bin'));
    const ext = path.extname(rawName).toLowerCase();
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.m4a']);
    if (!allowedExts.has(ext)) {
      return sendJson(res, 400, { ok: false, error: `Formato no permitido (${ext || 'sin extensión'})` });
    }

    const base = path.basename(rawName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 40) || 'media';
    const fileName = `${Date.now()}-${base}${ext}`;
    const targetDir = path.join(ROOT, 'media', folder);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, fileName);

    const MAX_UPLOAD_BYTES = 150 * 1024 * 1024; // 150 MB (ideal para videos del celular)
    let totalBytes = 0;
    let aborted = false;
    const writeStream = fs.createWriteStream(targetPath);

    req.on('data', (chunk) => {
      if (aborted) return;
      totalBytes += chunk.length;
      if (totalBytes > MAX_UPLOAD_BYTES) {
        aborted = true;
        writeStream.destroy();
        fs.unlink(targetPath, () => {});
        sendJson(res, 413, { ok: false, error: 'El archivo supera el límite de 150 MB' });
        req.destroy();
        return;
      }
      writeStream.write(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      writeStream.end(() => {
        const publicPath = `media/${folder}/${fileName}`;
        sendJson(res, 200, { ok: true, path: publicPath, size: totalBytes });
      });
    });

    req.on('error', () => {
      if (aborted) return;
      aborted = true;
      writeStream.destroy();
      fs.unlink(targetPath, () => {});
      sendJson(res, 500, { ok: false, error: 'Error al recibir el archivo' });
    });
    return;
  }

  // Optional: allow changing PIN from /admin
  if (cleanUrl === '/api/admin/pin' && req.method === 'PUT') {
    const pin = req.headers['x-admin-pin'];
    if (!verifyPin(pin)) {
      return sendJson(res, 401, { ok: false, error: 'PIN actual incorrecto' });
    }
    if (process.env.ADMIN_PIN) {
      return sendJson(res, 400, { ok: false, error: 'El PIN está fijado por variable de entorno ADMIN_PIN' });
    }
    try {
      const body = await readJsonBody(req, 4096);
      const newPin = String(body.newPin || '').trim();
      if (newPin.length < 4 || newPin.length > 20) {
        return sendJson(res, 400, { ok: false, error: 'El nuevo PIN debe tener entre 4 y 20 caracteres' });
      }
      fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({ pin: newPin }, null, 2), 'utf8');
      return sendJson(res, 200, { ok: true });
    } catch {
      return sendJson(res, 400, { ok: false, error: 'Solicitud inválida' });
    }
  }

  // ================= STATIC ROUTES =================
  // Block direct static access to private /data folder & server files
  if (
    cleanUrl === '/data' ||
    cleanUrl.startsWith('/data/') ||
    cleanUrl === '/server.js' ||
    cleanUrl === '/dev-server.js' ||
    cleanUrl === '/nginx.conf'
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  let relPath = cleanUrl;
  if (cleanUrl === '/' || cleanUrl === '') relPath = '/index.html';
  else if (cleanUrl === '/admin' || cleanUrl === '/admin/') relPath = '/admin.html';

  const filePath = path.resolve(ROOT, '.' + relPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cuaderno 6 Años corriendo en http://localhost:${PORT}`);
  console.log(`Panel de edición disponible en http://localhost:${PORT}/admin`);
});

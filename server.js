const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'hubs.json');
const BAD_WORDS = ['damn', 'hell', 'shit', 'fuck', 'bitch', 'ass'];

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ hubs: [] }, null, 2));
    }
}

function readData() {
    ensureDataFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

function collectBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1e6) req.destroy();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function generateId(prefix = '') {
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}${randomId}`;
}

function sanitizeMessage(text, protectiveMode) {
    if (!protectiveMode) return text;

    const escaped = BAD_WORDS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');

    return text.replace(regex, (match) => '#'.repeat(match.length));
}

function localHubCount(data) {
    return data.hubs.filter((hub) => hub.hosting === 'local').length;
}

function publicHubView(hub) {
    const {
        cooldownMap,
        ...safeHub
    } = hub;
    return safeHub;
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        return sendJson(res, 200, { ok: true });
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/hubs' && req.method === 'GET') {
        const data = readData();
        return sendJson(res, 200, { hubs: data.hubs.map(publicHubView) });
    }

    if (pathname === '/api/hubs' && req.method === 'POST') {
        try {
            const body = await collectBody(req);
            const data = readData();

            const hosting = body.hosting === 'local' ? 'local' : 'online';
            const display = body.display || 'public';

            if (hosting === 'local' && localHubCount(data) >= 6) {
                return sendJson(res, 400, { error: 'Local hub limit reached (6).' });
            }

            const localIndex = localHubCount(data) + 1;
            const isLocalDisplay = hosting === 'local' && display === 'local';

            const hub = {
                id: isLocalDisplay ? generateId('//LOCALHOST:') : generateId(),
                name: isLocalDisplay ? `LocalHost#${localIndex}` : body.name,
                banner: isLocalDisplay
                    ? 'https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg'
                    : body.banner,
                display,
                hosting,
                creator: body.creator,
                users: [body.creator],
                bannedUsers: [],
                messages: [{ user: 'SYSTEM', text: `${body.creator} created this hub.` }],
                settings: {
                    protectiveMode: false,
                    cooldownSec: 1
                },
                cooldownMap: {}
            };

            if (!hub.name || !hub.banner || !hub.creator) {
                return sendJson(res, 400, { error: 'Name, banner, and creator are required.' });
            }

            data.hubs.push(hub);
            writeData(data);

            return sendJson(res, 201, { hub: publicHubView(hub) });
        } catch (error) {
            return sendJson(res, 400, { error: 'Invalid request body.' });
        }
    }

    const hubMatch = pathname.match(/^\/api\/hubs\/([^/]+)$/);
    if (hubMatch && req.method === 'GET') {
        const hubId = decodeURIComponent(hubMatch[1]);
        const data = readData();
        const hub = data.hubs.find((item) => item.id === hubId);
        if (!hub) return sendJson(res, 404, { error: 'Hub not found.' });
        return sendJson(res, 200, { hub: publicHubView(hub) });
    }

    const joinMatch = pathname.match(/^\/api\/hubs\/([^/]+)\/join$/);
    if (joinMatch && req.method === 'POST') {
        try {
            const hubId = decodeURIComponent(joinMatch[1]);
            const body = await collectBody(req);
            const data = readData();
            const hub = data.hubs.find((item) => item.id === hubId);
            if (!hub) return sendJson(res, 404, { error: 'Hub not found.' });

            const username = body.username;
            if (!username) return sendJson(res, 400, { error: 'Username required.' });
            if (hub.bannedUsers.includes(username)) {
                return sendJson(res, 403, { error: 'You are banned from this hub.' });
            }

            const limit = hub.hosting === 'local' ? 10 : 20;
            if (!hub.users.includes(username) && hub.users.length >= limit) {
                return sendJson(res, 400, { error: 'Hub is full.' });
            }

            if (!hub.users.includes(username)) {
                hub.users.push(username);
                hub.messages.push({ user: 'SYSTEM', text: `${username} joined the hub.` });
            }

            writeData(data);
            return sendJson(res, 200, { hub: publicHubView(hub) });
        } catch (error) {
            return sendJson(res, 400, { error: 'Invalid request body.' });
        }
    }

    const messageMatch = pathname.match(/^\/api\/hubs\/([^/]+)\/messages$/);
    if (messageMatch && req.method === 'POST') {
        try {
            const hubId = decodeURIComponent(messageMatch[1]);
            const body = await collectBody(req);
            const data = readData();
            const hub = data.hubs.find((item) => item.id === hubId);
            if (!hub) return sendJson(res, 404, { error: 'Hub not found.' });

            const { username, text } = body;
            if (!username || !text) return sendJson(res, 400, { error: 'Username and text required.' });
            if (!hub.users.includes(username)) return sendJson(res, 403, { error: 'Join the hub first.' });

            const now = Date.now();
            const lastSentAt = hub.cooldownMap[username] || 0;
            const cooldownMs = Math.max(0, Number(hub.settings.cooldownSec || 1)) * 1000;
            const waitRemainingMs = cooldownMs - (now - lastSentAt);
            if (waitRemainingMs > 0) {
                return sendJson(res, 429, { error: `Cooldown active. Wait ${Math.ceil(waitRemainingMs / 1000)}s.` });
            }

            hub.cooldownMap[username] = now;
            hub.messages.push({
                user: username,
                text: sanitizeMessage(text.trim(), hub.settings.protectiveMode)
            });

            writeData(data);
            return sendJson(res, 200, { hub: publicHubView(hub) });
        } catch (error) {
            return sendJson(res, 400, { error: 'Invalid request body.' });
        }
    }

    const moderationMatch = pathname.match(/^\/api\/hubs\/([^/]+)\/(kick|ban)$/);
    if (moderationMatch && req.method === 'POST') {
        try {
            const hubId = decodeURIComponent(moderationMatch[1]);
            const action = moderationMatch[2];
            const body = await collectBody(req);
            const data = readData();
            const hub = data.hubs.find((item) => item.id === hubId);
            if (!hub) return sendJson(res, 404, { error: 'Hub not found.' });

            const { actor, target } = body;
            if (actor !== hub.creator) return sendJson(res, 403, { error: 'Only creator can moderate.' });
            if (!target || target === hub.creator) return sendJson(res, 400, { error: 'Invalid target user.' });

            hub.users = hub.users.filter((user) => user !== target);
            if (action === 'ban' && !hub.bannedUsers.includes(target)) {
                hub.bannedUsers.push(target);
            }
            hub.messages.push({ user: 'SYSTEM', text: `${target} was ${action}ned by ${actor}.` });
            writeData(data);

            return sendJson(res, 200, { hub: publicHubView(hub) });
        } catch (error) {
            return sendJson(res, 400, { error: 'Invalid request body.' });
        }
    }

    const settingsMatch = pathname.match(/^\/api\/hubs\/([^/]+)\/settings$/);
    if (settingsMatch && req.method === 'POST') {
        try {
            const hubId = decodeURIComponent(settingsMatch[1]);
            const body = await collectBody(req);
            const data = readData();
            const hub = data.hubs.find((item) => item.id === hubId);
            if (!hub) return sendJson(res, 404, { error: 'Hub not found.' });

            if (body.actor !== hub.creator) {
                return sendJson(res, 403, { error: 'Only creator can update settings.' });
            }

            if (typeof body.protectiveMode === 'boolean') {
                hub.settings.protectiveMode = body.protectiveMode;
            }

            if (body.cooldownSec !== undefined) {
                const cooldown = Number(body.cooldownSec);
                if (Number.isNaN(cooldown) || cooldown < 0) {
                    return sendJson(res, 400, { error: 'Cooldown must be a number >= 0.' });
                }
                hub.settings.cooldownSec = cooldown;
            }

            hub.messages.push({ user: 'SYSTEM', text: `${body.actor} updated hub settings.` });
            writeData(data);
            return sendJson(res, 200, { hub: publicHubView(hub) });
        } catch (error) {
            return sendJson(res, 400, { error: 'Invalid request body.' });
        }
    }

    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(__dirname, safePath);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const types = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg'
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        return fs.createReadStream(filePath).pipe(res);
    }

    const fallback = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(fallback).pipe(res);
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});

const LOCAL_BANNER_URL = 'https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg';

const state = {
    currentUser: null,
    currentHubId: null,
    hubs: [],
    pollTimer: null
};

function generateId(prefix = '') {
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 10).toUpperCase();

    return `${prefix}${randomId}`;
}

function getLocalHubCount() {
    return state.hubs.filter((hub) => hub.hosting === 'local').length;
}

function getLocalHubName(localCount = getLocalHubCount()) {
    return `LocalHost#${localCount + 1}`;
}

function getHubUserLimit(hub) {
    return hub.hosting === 'local' ? 10 : 20;
}

function getHubDisplayLabel(hub) {
    if (hub.hosting === 'local') {
        return 'LOCAL';
    }

    return hub.display.toUpperCase();
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error || 'Request failed');
    }

    return payload;
}

function stopPolling() {
    if (state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
    }
}

function startHubPolling(hubId) {
    stopPolling();
    state.pollTimer = setInterval(async () => {
        try {
            const data = await api(`/api/hubs/${encodeURIComponent(hubId)}`);
            UI.renderHubRoom(data.hub, true);
        } catch (error) {
            // ignore transient polling errors
        }
    }, 2000);
}

const UI = {
    renderAuth: () => {
        stopPolling();
        state.currentHubId = null;
        state.currentHub = null;
        document.getElementById('root').innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="retro-card w-full max-w-md">
                    <h1 class="text-3xl mb-2">CHAT HUB</h1>
                    <p class="mb-6 opacity-70">RETRO EDITION</p>
                    <div class="space-y-4">
                        <input type="text" id="username" class="retro-input" placeholder="USERNAME" required>
                        <input type="password" id="password" class="retro-input" placeholder="PASSWORD" required>
                        <button onclick="UI.handleLogin()" class="retro-button w-full">ENTER HUB</button>
                    </div>
                </div>
            </div>
        `;
    },

    handleLogin: async () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
    handleLogin: () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            return alert('Username and password required');
        }

        state.currentUser = username;
        await UI.renderDashboard();
    },

    renderDashboard: async () => {
        stopPolling();
        try {
            const data = await api('/api/hubs');
            state.hubs = data.hubs;
        } catch (error) {
            alert(error.message);
        }

        document.getElementById('root').innerHTML = `
            <div class="min-h-screen">
                <nav class="p-4 border-b-4 border-black flex justify-between items-center bg-[#2b2d31]">
                    <h2 class="text-xl">CHAT HUB</h2>
                    <div class="flex items-center gap-4">
                        <span>${state.currentUser}</span>
                        <button onclick="UI.renderAuth()" class="retro-button py-1 px-4">LOGOUT</button>
                    </div>
                </nav>
                <div class="p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="retro-card text-center cursor-pointer" onclick="UI.renderJoinHub()">
                        <div class="text-4xl mb-4">📥</div>
                        <h2 class="text-2xl mb-2">JOIN A HUB</h2>
                        <p class="opacity-70 mb-6">Enter an invite code to join.</p>
                        <button class="retro-button">JOIN</button>
                    </div>
                    <div class="retro-card text-center cursor-pointer" onclick="UI.renderCreateHub()">
                        <div class="text-4xl mb-4">🎨</div>
                        <h2 class="text-2xl mb-2">CREATE A HUB</h2>
                        <p class="opacity-70 mb-6">Start your own community.</p>
                        <button class="retro-button">CREATE</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderCreateHub: () => {
        const localSlotsUsed = state.hubs.filter((hub) => hub.hosting === 'local').length;
        const hubId = generateId();
        const localSlotsUsed = getLocalHubCount();
        const localLimitReached = localSlotsUsed >= 6;

        document.getElementById('root').innerHTML = `
            <div class="p-8 max-w-2xl mx-auto">
                <div class="retro-card">
                    <button onclick="UI.renderDashboard()" class="mb-4 opacity-70 hover:opacity-100"><- BACK</button>
                    <h2 class="text-2xl mb-6">CREATE NEW HUB</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold mb-1">HUB NAME (REQUIRED)</label>
                            <input type="text" id="hub-name" class="retro-input" placeholder="MY COOL HUB">
                        </div>
                        <div>
                            <label class="block text-xs font-bold mb-1">HUB ID (GENERATED)</label>
                            <input type="text" id="hub-id" class="retro-input opacity-50" value="${hubId}" disabled>
                        </div>
                        <div>
                            <label class="block text-xs font-bold mb-1">HUB BANNER URL (REQUIRED)</label>
                            <input type="text" id="hub-banner" class="retro-input" placeholder="https://...">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold mb-1">DISPLAY</label>
                                <select id="hub-display" class="retro-input">
                                    <option value="public">PUBLIC</option>
                                    <option value="private">PRIVATE</option>
                                    <option value="specific">SPECIFIC</option>
                                    <option value="local" ${localLimitReached ? 'disabled' : ''}>LOCAL</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold mb-1">HOSTING</label>
                                <select id="hub-hosting" class="retro-input">
                                    <option value="online">ONLINE</option>
                                    <option value="local" ${localLimitReached ? 'disabled' : ''}>LOCAL</option>
                                </select>
                            </div>
                        </div>
                        <p id="create-hub-note" class="text-xs opacity-70">
                            Local hosting supports up to 6 local hubs. Local hubs are shared for anyone on this local network server.
                            Local hosting supports up to 6 local hubs. Users per hub: local max 10, online max 20.
                        </p>
                        <button onclick="UI.handleCreateHub()" class="retro-button w-full mt-4">INITIALIZE HUB</button>
                    </div>
                </div>
            </div>
        `;

        UI.syncCreateHubLocalMode();
        document.getElementById('hub-hosting').addEventListener('change', UI.syncCreateHubLocalMode);
        document.getElementById('hub-display').addEventListener('change', UI.syncCreateHubLocalMode);
    },

    syncCreateHubLocalMode: () => {
        const hostingInput = document.getElementById('hub-hosting');
        const displayInput = document.getElementById('hub-display');
        const nameInput = document.getElementById('hub-name');
        const bannerInput = document.getElementById('hub-banner');
        const localDisplayOption = Array.from(displayInput.options).find((option) => option.value === 'local');
        const localCount = state.hubs.filter((hub) => hub.hosting === 'local').length;
        const localLimitReached = localCount >= 6;

        if (localDisplayOption) {
            localDisplayOption.disabled = hostingInput.value !== 'local' || localLimitReached;
        }

        if (hostingInput.value !== 'local' && displayInput.value === 'local') {
            displayInput.value = 'public';
        }

        const usingLocalDisplay = displayInput.value === 'local' && hostingInput.value === 'local';
        if (usingLocalDisplay) {
            nameInput.value = `LocalHost#${localCount + 1}`;
            bannerInput.value = LOCAL_BANNER_URL;
            nameInput.disabled = true;
            bannerInput.disabled = true;
        } else {
            nameInput.disabled = false;
            bannerInput.disabled = false;
        }
    },

    handleCreateHub: async () => {
        const name = document.getElementById('hub-name').value.trim();
        const banner = document.getElementById('hub-banner').value.trim();
        const display = document.getElementById('hub-display').value;
        const hosting = document.getElementById('hub-hosting').value;

        try {
            const data = await api('/api/hubs', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    banner,
                    display,
                    hosting,
                    creator: state.currentUser
                })
            });
            await UI.openHub(data.hub.id);
        } catch (error) {
            alert(error.message);
        }

        document.getElementById('hub-hosting').addEventListener('change', UI.syncCreateHubLocalMode);
        document.getElementById('hub-display').addEventListener('change', UI.syncCreateHubLocalMode);
    },

    syncCreateHubLocalMode: () => {
        const hostingInput = document.getElementById('hub-hosting');
        const displayInput = document.getElementById('hub-display');
        const nameInput = document.getElementById('hub-name');
        const bannerInput = document.getElementById('hub-banner');
        const hubIdInput = document.getElementById('hub-id');
        const localDisplayOption = Array.from(displayInput.options).find((option) => option.value === 'local');
        const localCount = getLocalHubCount();
        const localLimitReached = localCount >= 6;

        if (localDisplayOption) {
            localDisplayOption.disabled = hostingInput.value !== 'local' || localLimitReached;
        }

        if (hostingInput.value !== 'local' && displayInput.value === 'local') {
            displayInput.value = 'public';
        }

        const usingLocalDisplay = displayInput.value === 'local' && hostingInput.value === 'local';

        if (usingLocalDisplay) {
            nameInput.value = getLocalHubName(localCount);
            bannerInput.value = LOCAL_BANNER_URL;
            nameInput.disabled = true;
            bannerInput.disabled = true;
            hubIdInput.value = generateId('//LOCALHOST:');
        } else {
            nameInput.disabled = false;
            bannerInput.disabled = false;
            hubIdInput.value = generateId();
        }

        const note = document.getElementById('create-hub-note');
        if (localLimitReached) {
            note.textContent = 'You have reached the local hub cap (6/6). Create an online hub or delete a local one.';
        }
    },

    handleCreateHub: () => {
        const name = document.getElementById('hub-name').value;
        const banner = document.getElementById('hub-banner').value;
        const display = document.getElementById('hub-display').value;
        const hosting = document.getElementById('hub-hosting').value;
        const id = document.getElementById('hub-id').value;

        if (!name || !banner) {
            return alert('Name and Banner required');
        }

        if (hosting === 'local' && getLocalHubCount() >= 6) {
            return alert('Local hub limit reached (6).');
        }

        state.hubs.push({
            id,
            name,
            banner,
            display,
            hosting,
            creator: state.currentUser,
            users: [state.currentUser],
            messages: [
                { user: 'SYSTEM', text: `${state.currentUser} created this hub.` }
            ]
        });

        alert('Hub Created: ' + id);
        UI.renderHubRoom(state.hubs[state.hubs.length - 1].id);
    },

    renderJoinHub: async () => {
        stopPolling();
        try {
            const data = await api('/api/hubs');
            state.hubs = data.hubs;
        } catch (error) {
            alert(error.message);
        }

        document.getElementById('root').innerHTML = `
            <div class="p-8 max-w-4xl mx-auto">
                <div class="retro-card mb-8">
                    <button onclick="UI.renderDashboard()" class="mb-4 opacity-70 hover:opacity-100"><- BACK</button>
                    <h2 class="text-2xl mb-4">JOIN HUB</h2>
                    <p class="text-xs bg-yellow-900/30 p-4 border border-yellow-600 mb-6">
                        NOTE: Local hubs run from this machine as a local server. Devices on the same network can join and see shared messages.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${state.hubs.length === 0 ? '<p class="opacity-50">No hubs found...</p>' : state.hubs.map((h) => {
            const isMember = h.users.includes(state.currentUser);
            const isFull = h.users.length >= getHubUserLimit(h);
            return `
                        <div class="retro-card p-4">
                            <div class="h-32 bg-cover bg-center mb-4 border-2 border-black" style="background-image: url('${h.banner}')"></div>
                            <h3 class="font-bold">${h.name}</h3>
                            <p class="text-xs opacity-70">ID: ${h.id}</p>
                            <p class="text-xs opacity-70 mb-4">${h.users.length}/${getHubUserLimit(h)} USERS · ${getHubDisplayLabel(h)} · ${h.hosting.toUpperCase()}</p>
                            <button onclick="UI.openHub('${h.id}')" class="retro-button w-full py-1" ${!isMember && isFull ? 'disabled' : ''}>
                                ${isMember ? 'OPEN HUB' : (isFull ? 'HUB FULL' : 'JOIN')}
                            </button>
                        </div>
                    `;
        }).join('')}
                    ${state.hubs.length === 0 ? '<p class="opacity-50">No hubs found...</p>' :
            state.hubs.map((h) => {
                const isMember = h.users.includes(state.currentUser);
                const isFull = h.users.length >= getHubUserLimit(h);
                return `
                            <div class="retro-card p-4">
                                <div class="h-32 bg-cover bg-center mb-4 border-2 border-black" style="background-image: url('${h.banner}')"></div>
                                <h3 class="font-bold">${h.name}</h3>
                                <p class="text-xs opacity-70">ID: ${h.id}</p>
                                <p class="text-xs opacity-70 mb-4">${h.users.length}/${getHubUserLimit(h)} USERS · ${getHubDisplayLabel(h)} · ${h.hosting.toUpperCase()}</p>
                                <button onclick="UI.handleJoinHub('${h.id}')" class="retro-button w-full py-1" ${!isMember && isFull ? 'disabled' : ''}>
                                    ${isMember ? 'OPEN HUB' : (isFull ? 'HUB FULL' : 'JOIN')}
                                </button>
                            </div>
                        `;
            }).join('')}
                </div>
            </div>
        `;
    },

    handleJoinHub: (hubId) => {
        const hub = state.hubs.find((item) => item.id === hubId);

        if (!hub) {
            return alert('Hub not found.');
        }

        if (!hub.users.includes(state.currentUser)) {
            if (hub.users.length >= getHubUserLimit(hub)) {
                return alert('Hub is full.');
            }

            hub.users.push(state.currentUser);
            hub.messages.push({ user: 'SYSTEM', text: `${state.currentUser} joined the hub.` });
        }

        UI.renderHubRoom(hubId);
    },

    renderHubRoom: (hubId) => {
        const hub = state.hubs.find((item) => item.id === hubId);

        if (!hub) {
            return UI.renderJoinHub();
        }

        state.currentHub = hubId;

        document.getElementById('root').innerHTML = `
            <div class="min-h-screen p-6 max-w-6xl mx-auto">
                <div class="retro-card mb-6 p-4">
                    <button onclick="UI.renderJoinHub()" class="mb-2 opacity-70 hover:opacity-100"><- BACK TO HUB LIST</button>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 class="text-2xl">${hub.name}</h2>
                            <p class="text-xs opacity-70">Hub ID: ${hub.id} · ${hub.users.length}/${getHubUserLimit(hub)} users</p>
                        </div>
                        <div class="text-xs opacity-70">${getHubDisplayLabel(hub)} · ${hub.hosting.toUpperCase()}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
                    <aside class="retro-card p-4">
                        <h3 class="text-lg mb-3">USERS</h3>
                        <ul class="space-y-2 text-sm">
                            ${hub.users.map((user) => `<li class="border border-black px-2 py-1 bg-[#1e1f22]">${user}</li>`).join('')}
                        </ul>
                    </aside>

                    <section class="retro-card p-4 flex flex-col min-h-[420px]">
                        <h3 class="text-lg mb-3">HUB CHAT</h3>
                        <div class="flex-1 overflow-y-auto bg-[#1e1f22] border-2 border-black p-3 space-y-2 mb-4">
                            ${hub.messages.map((message) => `<p><span class="font-bold">${message.user}:</span> ${message.text}</p>`).join('')}
                        </div>
                        <div class="flex gap-2">
                            <input id="chat-message" type="text" class="retro-input" placeholder="Type a message...">
                            <button onclick="UI.sendMessage()" class="retro-button">CHAT</button>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    openHub: async (hubId) => {
        try {
            await api(`/api/hubs/${encodeURIComponent(hubId)}/join`, {
                method: 'POST',
                body: JSON.stringify({ username: state.currentUser })
            });
            const data = await api(`/api/hubs/${encodeURIComponent(hubId)}`);
            UI.renderHubRoom(data.hub);
            startHubPolling(hubId);
        } catch (error) {
            alert(error.message);
        }
    },

    renderHubRoom: (hub, fromPoll = false) => {
        state.currentHubId = hub.id;
        const isCreator = hub.creator === state.currentUser;
        const userMarkup = hub.users.map((user) => {
            const badge = user === hub.creator ? ' <span class="creator-badge">[CREATOR]</span>' : '';
            const controls = isCreator && user !== hub.creator
                ? `<div class="mt-1 flex gap-1"><button class="retro-button py-1 px-2" onclick="UI.moderateUser('${hub.id}','${user}','kick')">KICK</button><button class="retro-button py-1 px-2" onclick="UI.moderateUser('${hub.id}','${user}','ban')">BAN</button></div>`
                : '';
            return `<li class="border border-black px-2 py-2 bg-[#1e1f22]">${user}${badge}${controls}</li>`;
        }).join('');

        if (fromPoll && !document.getElementById('root').innerHTML.includes('HUB CHAT')) {
            return;
        }

        document.getElementById('root').innerHTML = `
            <div class="min-h-screen p-6 max-w-6xl mx-auto">
                <div class="retro-card mb-6 p-4">
                    <button onclick="UI.renderJoinHub()" class="mb-2 opacity-70 hover:opacity-100"><- BACK TO HUB LIST</button>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 class="text-2xl">${hub.name}</h2>
                            <p class="text-xs opacity-70">Hub ID: ${hub.id} · ${hub.users.length}/${getHubUserLimit(hub)} users</p>
                        </div>
                        <div class="text-xs opacity-70">${getHubDisplayLabel(hub)} · ${hub.hosting.toUpperCase()}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
                    <aside class="retro-card p-4">
                        <h3 class="text-lg mb-3">USERS</h3>
                        <ul class="space-y-2 text-sm">${userMarkup}</ul>
                    </aside>

                    <section class="retro-card p-4 flex flex-col min-h-[440px]">
                        <h3 class="text-lg mb-3">HUB CHAT</h3>
                        ${isCreator ? `
                        <div class="mb-4 p-3 border-2 border-black bg-[#1e1f22] text-sm space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="protective-mode" ${hub.settings.protectiveMode ? 'checked' : ''} onchange="UI.updateSettings('${hub.id}')">
                                <span>Protective Mode (hashes curse words/slang only)</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <span>Message send cooldown (seconds):</span>
                                <input id="cooldown-sec" type="number" min="0" class="retro-input w-24" value="${hub.settings.cooldownSec}" onchange="UI.updateSettings('${hub.id}')">
                            </label>
                        </div>` : ''}
                        <div class="flex-1 overflow-y-auto bg-[#1e1f22] border-2 border-black p-3 space-y-2 mb-4">
                            ${hub.messages.map((message) => `<p><span class="font-bold">${message.user}:</span> ${message.text}</p>`).join('')}
                        </div>
                        <div class="flex gap-2">
                            <input id="chat-message" type="text" class="retro-input" placeholder="Type a message...">
                            <button onclick="UI.sendMessage()" class="retro-button">CHAT</button>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    sendMessage: async () => {
        const input = document.getElementById('chat-message');
        const message = input.value.trim();
        if (!message || !state.currentHubId) return;

        try {
            const data = await api(`/api/hubs/${encodeURIComponent(state.currentHubId)}/messages`, {
                method: 'POST',
                body: JSON.stringify({ username: state.currentUser, text: message })
            });
            UI.renderHubRoom(data.hub);
            input.value = '';
        } catch (error) {
            alert(error.message);
        }
    },

    moderateUser: async (hubId, target, action) => {
        try {
            const data = await api(`/api/hubs/${encodeURIComponent(hubId)}/${action}`, {
                method: 'POST',
                body: JSON.stringify({ actor: state.currentUser, target })
            });
            UI.renderHubRoom(data.hub);
        } catch (error) {
            alert(error.message);
        }
    },

    updateSettings: async (hubId) => {
        const protectiveMode = document.getElementById('protective-mode').checked;
        const cooldownSec = Number(document.getElementById('cooldown-sec').value);

        try {
            const data = await api(`/api/hubs/${encodeURIComponent(hubId)}/settings`, {
                method: 'POST',
                body: JSON.stringify({
                    actor: state.currentUser,
                    protectiveMode,
                    cooldownSec
                })
            });
            UI.renderHubRoom(data.hub);
        } catch (error) {
            alert(error.message);
        }
    sendMessage: () => {
        const chatInput = document.getElementById('chat-message');
        const message = chatInput.value.trim();

        if (!message || !state.currentHub) {
            return;
        }

        const hub = state.hubs.find((item) => item.id === state.currentHub);
        if (!hub) {
            return;
        }

        hub.messages.push({ user: state.currentUser, text: message });
        UI.renderHubRoom(state.currentHub);
    }
};

UI.renderAuth();

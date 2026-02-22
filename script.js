const LOCAL_BANNER_URL = 'https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg';

const state = {
    currentUser: null,
    currentHub: null,
    hubs: []
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

const UI = {
    renderAuth: () => {
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

    handleLogin: () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            return alert('Username and password required');
        }

        state.currentUser = username;
        UI.renderDashboard();
    },

    renderDashboard: () => {
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

    renderJoinHub: () => {
        document.getElementById('root').innerHTML = `
            <div class="p-8 max-w-4xl mx-auto">
                <div class="retro-card mb-8">
                    <button onclick="UI.renderDashboard()" class="mb-4 opacity-70 hover:opacity-100"><- BACK</button>
                    <h2 class="text-2xl mb-4">JOIN HUB</h2>
                    <p class="text-xs bg-yellow-900/30 p-4 border border-yellow-600 mb-6">
                        NOTE: Online servers are hosted for 12-24 hours max. while local servers (In Your Own Network) are hosted indefinitely to your network only.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

const state = {
    currentUser: null,
    currentHub: null,
    hubs: []
};

function generateId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase() + 
           Math.random().toString(36).substring(2, 10).toUpperCase();
}

const UI = {
    renderAuth: () => {
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
        if (!username) return alert('Username required');
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
                            <input type="text" class="retro-input opacity-50" value="${hubId}" disabled>
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
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold mb-1">HOSTING</label>
                                <select id="hub-hosting" class="retro-input">
                                    <option value="online">ONLINE</option>
                                    <option value="local">LOCAL</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="UI.handleCreateHub('${hubId}')" class="retro-button w-full mt-4">INITIALIZE HUB</button>
                    </div>
                </div>
            </div>
        `;
    },

    handleCreateHub: (id) => {
        const name = document.getElementById('hub-name').value;
        const banner = document.getElementById('hub-banner').value;
        if (!name || !banner) return alert('Name and Banner required');
        
        state.hubs.push({
            id,
            name,
            banner,
            display: document.getElementById('hub-display').value,
            hosting: document.getElementById('hub-hosting').value,
            creator: state.currentUser
        });
        
        alert('Hub Created: ' + id);
        UI.renderDashboard();
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
                    <input type="text" class="retro-input" placeholder="SEARCH HUBS OR ENTER ID...">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${state.hubs.length === 0 ? '<p class="opacity-50">No hubs found...</p>' : 
                      state.hubs.map(h => `
                        <div class="retro-card p-4">
                            <div class="h-32 bg-cover bg-center mb-4 border-2 border-black" style="background-image: url('${h.banner}')"></div>
                            <h3 class="font-bold">${h.name}</h3>
                            <p class="text-xs opacity-70 mb-4">ID: ${h.id}</p>
                            <button class="retro-button w-full py-1">JOIN</button>
                        </div>
                      `).join('')}
                </div>
            </div>
        `;
    }
};

UI.renderAuth();
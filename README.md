# ChatHub

ChatHub blends Discord-style community chat with Zoom-inspired collaboration energy, wrapped in a retro UI.

## Core flow

- Sign in with username + password.
- Choose to **Join a Hub** or **Create a Hub**.
- Every hub is its own main room (no channels), with:
  - a hub-specific user list,
  - a shared hub chat,
  - message input + chat button.

## Local hub hosting (network shared)

Local hubs are now backed by the local server, so they persist and can be used across devices on the same network connected to that host.

- Messages are shared in real time via polling.
- Hub membership and chat history are saved to server storage.
- Hub creator is saved and shown with a **[CREATOR]** badge in the user list.

## Per-hub limits

- Local hubs: **10 users max**
- Online/public hubs: **20 users max**
- Max local hubs that can be created: **6**

## Local display mode (Create Hub)

Display includes a **Local** option with these rules:

- **Local display only works when Hosting = Local**.
- If Hosting is not Local, display option **Local** is disabled.
- When Display = Local, these fields are auto-set and locked:
  - Hub name → `LocalHost#<n>`
  - Hub banner →
    `https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg`
- Local hub IDs are auto-generated as:
  - `//LOCALHOST:<RANDOM_ID>`

## Creator controls inside each hub

The creator can manage only the hub they created:

- **Kick user**
- **Ban user**
- Toggle **Protective Mode** (hashes bad words/slang terms only, not full messages)
- Set **Message send cooldown** in seconds (default `1`)
  - Cooldown is per user (each user has their own timer)

## Run

```bash
node server.js
```

Then open `http://<your-local-ip>:5000` from any device on the same network.
ChatHub blends the fast, community-focused style of Discord with the familiar call-and-collaboration feel of Zoom, then wraps it in a retro interface.

## What ChatHub currently includes

- **Simple account entry flow** with username + password fields.
- **Dashboard actions** to either:
  - **Join a Hub**
  - **Create a Hub**
- **Hub creation settings** for name, generated ID, banner, display mode, and hosting mode.

## What happens after you join a Hub

Once you join a hub, you enter that hub's **main room** (not channel-based).

Inside each hub you get:

- A **user list panel** (hub members only).
- A **chat area** with message history.
- A **chat input + chat button** to send messages.

### Per-hub user limits

- **Local hubs** support up to **10 users**.
- **Public/online hubs** support up to **20 users**.

## Hub isolation (separate users per server)

Each created server has its **own independent hub** with its **own member list and chat history**.

Example:

- Hub A may include `bunnybuns223` because they joined that hub.
- Hub B may not include `bunnybuns223` yet because they have not joined it.

## New Local display mode behavior (Hub Creation)

A new display option, **Local**, is included in the display dropdown.

### Availability rule

- **Local display is only usable when Hosting is set to Local.**
- If hosting is not local, the **Local** display option is grayed out and not interactable.

### Automatic lock behavior when Display = Local

When display is switched to **Local** (with local hosting), these fields become grayed out and uneditable:

- **Hub Name**
- **Hub Banner Link**

And they are auto-filled with required defaults:

- **Hub Name** → `LocalHost#<n>`
  - `n` increases by creation order of local hubs.
  - Maximum local hubs: **6**.
- **Hub Banner Link** →
  `https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg`

### Hub ID change for Local mode

When Local display mode is active, hub ID is regenerated with the required prefix:

- `//LOCALHOST:<RANDOM_ID>`

## Local hosting cap

- You can create up to **6 local hubs**.
- After reaching 6, local creation options are disabled until a local hub is removed.

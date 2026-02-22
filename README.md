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

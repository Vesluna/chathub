# ChatHub

ChatHub combines the best parts of Zoom and Discord into one simple social platform. It is designed for quick account setup, easy hub creation, and focused real-time conversation.

## Core Experience

- **Secure account creation** with password protection.
- **Join Hub** and **Create Hub** actions from the main entry flow.
- A clear, lightweight interface built for fast navigation.

## What Happens After You Join a Hub

Once a user joins a chat hub, the main hub view is designed around people and conversation (not channels):

- **No channel system** inside the hub.
- A **live user list** showing only users who joined that specific hub.
- A **chat button** and **message input area** for real-time communication.
- Every created server/hub is fully isolated and has its **own user population**.
  - Example: `bunnybuns223` may appear in Hub A but not Hub B if they have not joined Hub B.

### Hub Capacity Rules

- **Local hosting hubs:** max **10 users** per hub.
- **Public hosting hubs:** max **20 users** per hub.

## Hub Creation: Display Option "Local"

A new display dropdown option is available in hub creation: **Local**.

### Availability Rules

- **Local** is only selectable when **Hosting = Local**.
- If hosting is not Local, the **Local** display option is:
  - grayscaled
  - non-interactable

### Automatic Locked Changes When Display = Local

When the display mode is switched to **Local**, these fields become grayscaled and non-interactable until another display mode is selected:

- **Hub Name**
- **Hub Banner Link**

Their values are also auto-filled and locked:

- **Hub Name** becomes:
  - `LocalHost[#]`
  - Number increments by local-host count (for example `LocalHost#1`, `LocalHost#2`, etc.)
  - Up to **6 local hosts maximum**

- **Hub Banner Link** becomes:
  - `https://img.freepik.com/premium-vector/web-hosting-concept-computer-server-database-storage_197170-767.jpg`

### Hub ID Format Change for Local Hubs

When a Local display hub is created, its Hub ID is re-randomized and prefixed with:

- `//LOCALHOST:`

Final format example:

- `//LOCALHOST:AB12CD34`

## Vision

ChatHub is built to keep collaboration and social chat simple:

- quick onboarding
- clear per-hub identity
- predictable user limits based on hosting type
- instant messaging in a focused hub space

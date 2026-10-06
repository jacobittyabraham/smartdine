# SmartDine Elite

Premium React/Vite frontend for a high-end restaurant table-side experience.

## Run

```bash
npm install
npm run dev
```

## Shared order tracking

Orders and status updates are stored by the API, not by the browser. Both
laptops must use the same reachable API server. Create a `.env` file from
`.env.example` and set `VITE_API_BASE_URL` to the backend's LAN or deployed
URL, for example `http://192.168.1.20:8080/api`, before building or starting
Vite. Do not leave the default `localhost` value when the laptops are
different machines.

The customer tracking page and kitchen screen recover active orders from the
API, so they no longer require the order to have been created in that
laptop's browser storage.

## Included

- Premium light luxury / glassmorphism visual system
- Editorial typography
- Animated ambient background
- Scroll progress
- Scroll reveal animations
- Hero parallax
- Animated marquee
- Food discovery and search
- Food customization
- Cart and checkout
- Order tracking
- Guest service requests
- Digital bill/payment UI
- Staff operations dashboard
- Responsive mobile layouts
- Three.js / React Three Fiber dependencies ready for future 3D/WebXR modules

## Production roadmap

Connect this frontend to Node/Express + MySQL/PostgreSQL, Socket.IO, authentication, real payments, inventory, analytics, cloud image storage and WebXR. Do not present browser-only demo data as real-time production data.

# JPC Online Canteen — React frontend

React (Vite) na bersyon ng dating HTML frontend. Ang backend (Express + TiDB sa Render) ay **hindi nagbago**.

## Lokal na pagtakbo

```bash
# Terminal 1 — backend (nasa root ng repo)
node server.js            # http://localhost:3000

# Terminal 2 — frontend
cd client
npm install
npm run dev               # http://localhost:5173
```

Ang `/api` at `/uploads` ay awtomatikong ipinapasa ng Vite sa `http://localhost:3000`.
Kung ibang address ang backend: `VITE_BACKEND_URL=http://localhost:4000 npm run dev`.

## Deploy sa Netlify

Sa **Site configuration → Build & deploy → Build settings**:

| Setting | Value |
|---|---|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |

Ang `client/public/_redirects` ang nagpapasa ng `/api/*` at `/uploads/*` sa Render at nagpapagana
ng direktang pagbukas ng mga route (`/menu`, `/admin/orders`, atbp.).

## Mga route

| Dati | Ngayon |
|---|---|
| `0-landing.html` | `/` |
| `customer-login.html` | `/login` |
| `customer-register.html` | `/register` |
| `1-menu.html` | `/menu` |
| `cart.html` | `/cart` |
| `3-checkout.html` | `/checkout` |
| `4-order-confirmation.html` | `/order-confirmation` |
| `my-orders.html` | `/my-orders` |
| `incoming-orders.html` | `/incoming-orders` |
| `admin-login.html` | `/admin/login` |
| `5-admin-orders.html` | `/admin/orders` |
| `6-admin-sales.html` | `/admin/sales` |
| `7-admin-menu.html` | `/admin/menu` |

Gumagana pa rin ang mga lumang URL (hal. `/customer-login.html`) — nire-redirect sila sa bago.

## Istruktura

```
client/
  public/            manifest.json, sw.js (PWA), _redirects, images/, uploads/
  src/
    main.jsx         entry point
    App.jsx          mga route
    pages/           isang component kada page
    components/      Brand, ProgressTrack, AdminSidebar, RouteGuards
    context/         CartContext (cart sa localStorage)
    hooks/           usePage (body class + title), usePolling (auto-refresh)
    lib/             session.js, orders.js, firebase.js
    styles/          CSS ng bawat page (galing sa orihinal, naka-scope)
```

## Paalala

- Ang CSS ng bawat page ay kinopya mula sa orihinal na `<style>` at naka-scope sa `body.pg-xxx`
  para hindi magbanggaan. Bootstrap 5.3.8 pa rin ang gamit.
- Kung magpapalit ka ng larawan sa `images/` o `uploads/` na pareho ang filename, i-bump ang
  `CACHE_NAME` sa `public/sw.js` para ma-refresh ang cache ng mga user.
- Ang Firebase config at `ADMIN_EMAIL` ay nasa `src/lib/firebase.js`.

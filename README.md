# ReCore — Inventory Management

A modern, browser-based inventory management system built with React 19 and Vite. ReCore lets you manage products, warehouses, stock movements, receipts, and deliveries — all stored locally in your browser with no backend required.

---

## Features

- **Dashboard** — at-a-glance KPIs: total products, receipts, deliveries, low-stock alerts
- **Receipts** — create inbound stock receipts with auto-generated references (`WH/IN/0001`), workflow: Draft → Ready → Done
- **Deliveries** — create outbound deliveries (`WH/OUT/0001`), workflow: Draft → Waiting → Ready → Done with automatic stock reservation checks
- **Adjustments** — direct stock correction with reason tracking
- **Stock** — full product stock table with per-unit cost, on-hand quantity, and free-to-use (un-reserved) quantity
- **Move History** — chronological log of all stock movements, color-coded IN (green) / OUT (red)
- **Warehouses** — CRUD management of warehouse locations
- **Locations** — manage bin/shelf locations within each warehouse
- **Authentication** — Login ID based sign-in, signup with validation, password reset via OTP
- **Persistent storage** — all data saved to `localStorage`, no server needed
- **Demo mode** — one-click demo credentials on the login page

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Icons | Lucide React v0.577 |
| State | `useReducer` + `useContext` |
| Styling | Plain CSS with custom properties |
| Storage | `localStorage` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd CoreI

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder and can be served from any static host.

### Preview Production Build

```bash
npm run preview
```

---

## Demo Credentials

A demo account is pre-seeded automatically on first load.

| Field | Value |
|---|---|
| Login ID | `admin` |
| Password | `Admin@123` |

You can also click **"Use Demo Credentials"** on the login page to auto-fill the form.

---

## Account Rules

When signing up for a new account:

| Field | Rule |
|---|---|
| Login ID | 6–12 characters, alphanumeric, unique |
| Email | Valid email format, unique |
| Password | 8+ characters, must include uppercase, lowercase, and a special character |

---

## Project Structure

```
src/
├── context/
│   ├── AuthContext.jsx       # Login, signup, OTP, session
│   └── AppContext.jsx        # Global state — all CRUD + workflow actions
├── data/
│   └── store.js              # localStorage helpers + seed data
├── components/
│   └── Layout/
│       ├── Sidebar.jsx/.css
│       ├── TopBar.jsx/.css
│       └── AppLayout.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Stock.jsx
│   ├── Operations/
│   │   ├── Receipts.jsx
│   │   ├── Deliveries.jsx
│   │   ├── Adjustments.jsx
│   │   └── MoveHistory.jsx
│   ├── Settings/
│   │   ├── Warehouses.jsx
│   │   └── Locations.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ForgotPassword.jsx
│   └── Profile.jsx
├── App.jsx                   # Routes
└── index.css                 # Design system (CSS custom properties)
```

---

## Operation Workflows

### Receipt (Inbound)

```
Draft  →  [TODO]  →  Ready  →  [Validate]  →  Done
```
Validating a receipt increments stock for each line item.

### Delivery (Outbound)

```
Draft  →  [CHECK]  →  Waiting (insufficient stock)
                  →  Ready   →  [Validate]  →  Done
```
Checking a delivery reserves stock. Validating deducts it.

---

## Reference Format

All operations receive an auto-incremented reference tied to the warehouse:

```
WH/IN/0001    ← Receipt from warehouse with code "WH"
WH/OUT/0001   ← Delivery from warehouse with code "WH"
```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

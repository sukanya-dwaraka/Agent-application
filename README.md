# AgentFlow — MERN Stack Assignment

A full-stack admin dashboard built with **MongoDB · Express · React (Vite) · Node.js**

---

## Features

- **Admin Auth** — Register/login with JWT; protected routes
- **Agent Management** — Create, edit, delete agents with country-code mobile numbers
- **CSV/XLSX Upload** — Upload lists, auto-distribute round-robin across agents
- **Dashboard** — Live stats and recent activity overview

---

## Project Structure

```
mern-app/
├── backend/                  # Express + Node.js API
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── agentController.js
│   │   └── listController.js
│   ├── middleware/
│   │   └── auth.js           # JWT guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Agent.js
│   │   └── TaskList.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── agents.js
│   │   └── lists.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AppLayout.jsx
    │   │   │   └── AppLayout.module.css
    │   │   └── ui/
    │   │       ├── Button.jsx / .module.css
    │   │       ├── Input.jsx  / .module.css
    │   │       ├── Modal.jsx  / .module.css
    │   │       ├── Badge.jsx  / .module.css
    │   │       └── StatCard.jsx / .module.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx    / Auth.module.css
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx / Dashboard.module.css
    │   │   ├── Agents.jsx    / Agents.module.css
    │   │   └── Lists.jsx     / Lists.module.css
    │   ├── services/
    │   │   └── api.js        # Axios instance
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

---

## Setup & Running

### 1. Clone / extract the project

```bash
cd mern-app
```

### 2. Backend

```bash
cd backend
npm install
```

Edit `.env` if needed:

```env
MONGODB_URI=mongodb://localhost:27017/mern_agent_db
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
JWT_EXPIRE=7d
```

Start the server:

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

The API runs on **http://localhost:5000**

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app runs on **http://localhost:3000**
Vite proxies `/api/*` → `http://localhost:5000`

---

## CSV Format

The uploaded file must have these exact column headers (case-insensitive):

| FirstName | Phone      | Notes            |
|-----------|------------|------------------|
| Alice     | 9876543210 | Call in morning  |
| Bob       | 9123456789 | Follow up needed |

- **Phone** must contain digits only
- Accepted formats: `.csv`, `.xlsx`, `.xls`

### Distribution Logic

Items are distributed **round-robin** across all available agents.

Example — 26 items, 5 agents:
- Agents 1–2 get 6 items each
- Agents 3–5 get 5 items each

---

## API Endpoints

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | /api/auth/register   | No   | Create admin account     |
| POST   | /api/auth/login      | No   | Login, get JWT           |
| GET    | /api/auth/me         | Yes  | Get current user         |
| GET    | /api/agents          | Yes  | List all agents          |
| POST   | /api/agents          | Yes  | Create agent             |
| PUT    | /api/agents/:id      | Yes  | Update agent             |
| DELETE | /api/agents/:id      | Yes  | Delete agent             |
| POST   | /api/lists/upload    | Yes  | Upload & distribute file |
| GET    | /api/lists           | Yes  | All upload batches       |
| GET    | /api/lists/:id       | Yes  | Single batch             |
| DELETE | /api/lists/:id       | Yes  | Delete batch             |

---

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Database | MongoDB + Mongoose       |
| Backend  | Node.js + Express.js     |
| Auth     | JWT + bcryptjs           |
| Frontend | React 18 + Vite          |
| Routing  | React Router v6          |
| HTTP     | Axios                    |
| Icons    | Lucide React             |
| Toasts   | React Toastify           |
| Styling  | CSS Modules              |

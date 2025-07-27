# 🔐 Authentication Redis

A full-stack authentication system using **Redis** for session management and rate limiting, built with **Node.js (Express)**, **React + TypeScript**, **MongoDB**, and **Docker**. It includes login, signup, JWT token handling, and refresh logic – all backed by Redis for efficient token storage and invalidation.

---

## ✨ Features

- User Signup & Login with JWT
- Redis-based access and refresh token storage
- Session expiration and refresh flow
- Rate limiting with Redis (prevents brute force)
- Protected route via access token validation
- Logout with Redis token invalidation
- Fully Dockerized setup
- Simple React frontend for auth flow
- API docs via Swagger (`/api-docs`)

---

## 📦 Tech Stack

| Frontend       | Backend         | Database        | Auth         | DevOps     |
|----------------|------------------|------------------|--------------|------------|
| React + Vite   | Express + TypeScript | MongoDB + Mongoose | JWT + Redis  | Docker Compose |

---

## 📁 Folder Structure (High-Level)

```
/frontend    → React App (Login, Signup, Dashboard)
/backend     → Express Server (API logic, Redis, MongoDB)
/config      → MongoDB + Redis configuration
/routes      → API routes
/controllers → Auth logic
/utils       → Token helpers
/middleware  → Auth, Rate Limit
```

---

## 🚀 Getting Started

> Make sure you have **Docker** and **Docker Compose** installed before continuing.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/Authentication-Redis.git
cd Authentication-Redis
```

### 2️⃣ Run the Application

```bash
docker-compose up --build
```

📌 This spins up:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- Backend on `localhost:3000`
- Frontend on `localhost:5173`

---

## 📂 API Endpoints

| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| POST   | `/api/auth/signup`        | Register a new user       |
| POST   | `/api/auth/login`         | Login and get tokens      |
| POST   | `/api/auth/logout`        | Logout and destroy session|
| GET    | `/api/auth/verifytoken`   | Check current user        |
| POST   | `/api/auth/refreshtoken`  | Get new access token      |

🔎 API Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🧪 Test Credentials (Optional)

You can register a new user via the Signup page, or use Postman to test.

---

## 🧰 Environment Variables

Set the following in your `.env` (already configured in `docker-compose.yml`):

```env
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
MONGODB_URI=mongodb://mongo:27017/redis-auth
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 📸 Frontend Pages

- `/` → Automatically shows Login or Dashboard
- Login form with validation
- Signup form with validation
- Authenticated Dashboard with user details
- Logout button to clear session

---

## 📄 License

MIT

---

## 🙌 Contributions

Feel free to fork, raise issues, or contribute! PRs are welcome.

# 🚀 AI PR Reviewer - Backend

## 🧠 Overview

Backend service for AI-powered GitHub Pull Request analysis.

Built with:

* Node.js + Express
* Prisma (PostgreSQL)
* Redis
* WebSocket (Socket.io)
* FastAPI integration

---

## ⚙️ Setup Instructions

### 1️⃣ Install dependencies

```bash
npm install
```

---

### 2️⃣ Setup environment variables

```bash
cp .env.example .env
```

Fill required values:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/pragent
JWT_SECRET=your_secret
FASTAPI_URL=http://localhost:8000
WEBHOOK_SECRET=my_super_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

### 3️⃣ Run server

```bash
npm run dev
```

---

## 🌐 API Documentation

* Swagger UI → http://localhost:3000/api/docs
* OpenAPI JSON → http://localhost:3000/api/docs.json

---

## 🔑 Main APIs

### 🔐 Auth

POST `/api/auth/login`

---

### 🚀 Analyze PR

POST `/api/pr/analyze`

```json
{
  "prUrl": "https://github.com/user/repo/pull/1"
}
```

---

### 📊 PR Status

GET `/api/pr/:prId/status`

---

### 📡 Webhook (AI → Backend)

POST `/api/webhooks/agent`

Headers:

```
x-signature: HMAC_SHA256
```

---

## ⚡ WebSocket (Real-time updates)

### Connect:

```
ws://localhost:3000
```

### Join room:

```
join:pr → prId
```

### Receive events:

```
pr:step
```

---

## 🔐 Security Notes

* Webhook protected using HMAC SHA256
* JWT used for authentication
* Never commit `.env`

---

## 🧪 Testing Flow

1. Login
2. Send PR URL
3. Get `prId`
4. Trigger webhook
5. Watch step updates

---

## 👨‍💻 Author

Akshat Saini

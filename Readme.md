# 🛒 Full Stack E-commerce Web Application  

A full-stack e-commerce web application built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with a focus on scalability, performance, and user-friendly design.  

---

## 🚀 Features  
- User Authentication & Authorization (Signup/Login)  
- Product Catalog with Categories  
- Shopping Cart & Checkout System  
- Order Management  
- RESTful API Integration  
- Responsive UI with Tailwind CSS  
- Secure Database (MongoDB)  
- Deployment on Cloud Platforms  

---

## 🛠️ Tech Stack  
**Frontend:** React.js, JavaScript (ES6+), HTML, CSS, Tailwind CSS  
**Backend:** Node.js, Express.js, RESTful APIs  
**Database:** MongoDB  
**Version Control:** Git, GitHub  

## Authentication configuration

Authentication uses short-lived access cookies and rotating refresh cookies. Both are HttpOnly; the frontend must send requests with credentials enabled. In production, configure:

- `JWT_SECRET`: a strong secret used to sign access tokens.
- `REFRESH_TOKEN_SECRET`: a separate strong secret used to sign refresh tokens.
- `FRONTEND_URL` (or comma-separated `CORS_ORIGINS`): exact frontend origin(s), including scheme.
- `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` when the frontend and API are on different sites. For same-site deployments, `lax` may be used.
- `COOKIE_DOMAIN` only when cookies need to be shared across subdomains.
- `REDIS_URL`: Redis connection URL used for short-lived registration verification codes.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`: SMTP connection settings used to deliver registration codes.
- `SMTP_SECURE=true` when the SMTP server requires implicit TLS (typically port 465); otherwise use `false` (typically port 587).
- `SMTP_FROM` (optional): sender address shown on registration verification emails; defaults to `SMTP_USER`.

Local development allows `http://localhost:5173` and `http://127.0.0.1:5173` by default. The frontend `VITE_BACKEND_URL` must point to the API origin. After switching from bearer tokens, users must sign in again to establish cookie sessions.

New customer registration requires an email verification code. Codes are stored in Redis for 10 minutes, can be requested once per minute, and are limited to five verification attempts.

---

## 📂 Project Structure  
```bash
.
├── backend     # Server-side code (Node.js, Express.js, APIs)
├── frontend    # Client-side code (React.js, Tailwind CSS)
├── database    # MongoDB schema
└── README.md   # Documentation

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

## Product reviews

Authenticated customers can review a product only when one of their orders containing that product has `status: "Delivered"`. Reviews are unique per customer and product, can be edited by their author, and are moderated from the product's admin edit view. Product pages display paginated reviews and their calculated average rating.

The review collection uses a unique compound index on `{ user: 1, product: 1 }` and a `{ product: 1, createdAt: -1 }` query index. Run the review index migration before deploying the review API to a database that may contain old indexes. It inspects review documents and indexes, preserves reviews, detects duplicate pairs without deleting them, removes only indexes containing obsolete `userId`/`productId` keys or redundant copies of the canonical unique constraint, and creates/verifies the intended indexes. It is dry-run by default:

```powershell
cd backend
npm run migrate:review-indexes
npm run migrate:review-indexes:apply
```

Back up the database before applying the migration. The migration also reconciles each product's `rating` and `numReviews` from its review documents, clearing seeded placeholder metrics where no reviews exist. If duplicate `(user, product)` reviews exist or a document has invalid/conflicting references or an invalid rating, migration stops before changing indexes, reviews, or product metrics; resolve the records manually without deleting valid reviews, then rerun. For a database without legacy references, Mongoose declares the same indexes, but production deployments should still run this explicit migration because Mongoose does not remove obsolete indexes.

The backend integration test uses Node's built-in test runner and an isolated MongoDB database whose name contains `test`. Set `TEST_MONGO_URL` to that database and run `npm test` from `backend/`.

---

## 📂 Project Structure  
```bash
.
├── backend     # Server-side code (Node.js, Express.js, APIs)
├── frontend    # Client-side code (React.js, Tailwind CSS)
├── database    # MongoDB schema
└── README.md   # Documentation

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
- `GOOGLE_CLIENT_ID`: Google OAuth Web client ID used by the backend to verify Google ID tokens.
- `VITE_GOOGLE_CLIENT_ID`: the same Google OAuth Web client ID, configured in Vercel for the frontend build.
- `REDIS_URL`: Redis connection URL used for short-lived registration verification codes.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`: SMTP connection settings used to deliver transactional emails.
- `SMTP_SECURE=true` when the SMTP server requires implicit TLS (typically port 465); otherwise use `false` (typically port 587).
- `SMTP_FROM` (optional): sender address shown on transactional emails; defaults to `SMTP_USER`.
- `ADMIN_NOTIFICATION_EMAIL`: recipient for new-order notification emails.

Local development allows `http://localhost:5173` and `http://127.0.0.1:5173` by default. The frontend `VITE_BACKEND_URL` must point to the API origin. After switching from bearer tokens, users must sign in again to establish cookie sessions.

Google sign-in uses Google Identity Services to obtain an ID token in the browser. Configure a Google OAuth client of type **Web application**, and add each frontend origin (for example, `http://localhost:5173` and the Vercel production/custom domain) to its **Authorized JavaScript origins**. Set the client ID as `VITE_GOOGLE_CLIENT_ID` in Vercel and `GOOGLE_CLIENT_ID` in Render; do not put a client secret in the frontend. No OAuth redirect URI is needed for this ID-token flow. The backend verifies the token and creates a customer account when needed. For security, it does not automatically link a Google identity to an existing password account with the same email; users with an existing account should sign in with their password.

New customer registration requires an email verification code. Codes are stored in Redis for 10 minutes, can be requested once per minute, and are limited to five verification attempts.

MegaKart sends branded HTML and plain-text emails for registration verification, a welcome message after account creation and newsletter subscription, paid order confirmation (including payment receipt details), shipment, delivery, cancellation, and new-order alerts. Customer and admin delivery outcomes are logged if SMTP delivery fails; account, subscription, order, and fulfillment updates remain saved. Shipment emails currently note that tracking details will be shared when available because tracking numbers are not yet collected by the order workflow. Configure the SMTP variables above and `ADMIN_NOTIFICATION_EMAIL` to enable delivery.

Password resets use a six-digit email code stored as a digest in Redis. Codes expire after 10 minutes, can be requested once per minute, and allow five verification attempts. Password reset revokes all existing sessions; changing a password from My Account keeps the current session active while signing out other sessions. Refund-processing and Google sign-in notification emails are not available until those workflows exist.

## Product reviews

Authenticated customers can review a product only when one of their orders containing that product has `status: "Delivered"`. Reviews are unique per customer and product, can be edited by their author, and are moderated from the product's admin edit view. Product pages display paginated reviews and their calculated average rating.

The review collection uses a unique compound index on `{ user: 1, product: 1 }` and a `{ product: 1, createdAt: -1 }` query index. Run the review index migration before deploying the review API to a database that may contain old indexes. It inspects review documents and indexes, preserves reviews, detects duplicate pairs without deleting them, removes only indexes containing obsolete `userId`/`productId` keys or redundant copies of the canonical unique constraint, and creates/verifies the intended indexes. It is dry-run by default:

```powershell
cd backend
npm run migrate:review-indexes
npm run migrate:review-indexes:apply
```

Back up the database before applying the migration. The migration also reconciles each product's `rating` and `numReviews` from its review documents, clearing seeded placeholder metrics where no reviews exist. If duplicate `(user, product)` reviews exist or a document has invalid/conflicting references or an invalid rating, migration stops before changing indexes, reviews, or product metrics; resolve the records manually without deleting valid reviews, then rerun. For a database without legacy references, Mongoose declares the same indexes, but production deployments should still run this explicit migration because Mongoose does not remove obsolete indexes.

## Shopping assistant

The customer-facing assistant uses a provider adapter: Gemini is the hosted default, Ollama is optional for local development, and deterministic replies remain available when AI is disabled, misconfigured, unavailable, timed out, or rate-limited. Gemini requests use the documented `gemini-3.5-flash-lite` model by default through Google's still-supported `generateContent` REST API, with bounded conversation history, a configurable timeout, and a 160-token output cap. Only catalogue/support context and sanitized recent messages are sent to AI. Order status is looked up from MongoDB and is never sent to an AI provider.

Products are searched only among published, in-stock items; budget recommendations apply the active sale price. Requests with INR/rupee budgets ask for currency clarification because MegaKart's existing catalogue and storefront prices are in USD; the assistant does not perform currency conversion. Product cards always use real MongoDB IDs, names, prices, and images. Shipping prices/timelines, return/refund terms, warranty information, and payment policies are not confirmed in the current store information, so the assistant refers customers to the configured support address instead of inventing policies.

### Local setup

Copy `backend/.env.example` to `backend/.env`, fill in the existing MongoDB and authentication settings, and add an API key from [Google AI Studio](https://aistudio.google.com/apikey). Keep the key only on the backend; do not add it to any `VITE_` variable. From the repository root:

```powershell
cd backend
npm install
npm test
npm run dev
```

Default hosted configuration:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=<Google AI Studio API key>
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_TIMEOUT_MS=20000
CHAT_AI_DAILY_LIMIT=50
SUPPORT_EMAIL=megakart991@gmail.com
```

`GEMINI_TIMEOUT_MS` is optional and accepts 1,000–60,000 milliseconds (default 20,000). If Gemini is temporarily overloaded, the assistant does not retry automatically; it returns its safe fallback and logs Google's status and diagnostic message without logging the key or prompt.

For local Ollama only, install [Ollama](https://ollama.com/) and pull the model with `ollama pull gemma3:1b`, then set `AI_PROVIDER=ollama`, `OLLAMA_URL=http://127.0.0.1:11434`, and `OLLAMA_MODEL=gemma3:1b`. Set `AI_PROVIDER=none` to disable model calls and use rule-based responses.

### Render deployment and free-tier limits

Add the same AI variables to the Render backend service's Environment settings. Keep `GEMINI_API_KEY` secret and do not define it in Vercel. Vercel needs only the existing `VITE_BACKEND_URL`; keep the current `FRONTEND_URL`/`CORS_ORIGINS` and cookie settings for the deployed Vercel origin. `OLLAMA_*` variables are not needed on Render.

To avoid paid usage, create/use a Gemini project that has **not** been upgraded or linked to Cloud Billing, and do not enable paid billing, prepaid credits, or auto-reload. The application does not retry quota failures, change models, or switch to a paid provider; it falls back to database-backed product search and verified support responses. The free-tier model list, eligibility, rate limits, and daily quotas are controlled by Google, vary by project/model/region, and may change. Check the [official Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [active rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) before deployment. Exhausted quotas or unavailable free-tier access temporarily disable natural-language replies but do not disable product search or authenticated order lookup.

Requests are limited to 15 per client IP per 10 minutes, input to 500 characters, conversation context to six short messages, and AI output to 160 tokens. Identical greetings can reuse a short-lived in-memory response; confirmed policy answers bypass AI entirely. AI calls are capped at 50 per server process per UTC day by default (`CHAT_AI_DAILY_LIMIT` can lower or raise this up to 1,000). These in-memory controls are per Render process and reset on restart/scale; provider project quotas remain the authoritative shared limit. No quota design can guarantee a hosted service remains free indefinitely.

To run the backend test suite, use `npm test` from `backend/`. Tests use Node's built-in test runner and stub database/provider calls; no external AI key or MongoDB instance is required.

---

## 📂 Project Structure  
```bash
.
├── backend     # Server-side code (Node.js, Express.js, APIs)
├── frontend    # Client-side code (React.js, Tailwind CSS)
├── database    # MongoDB schema
└── README.md   # Documentation

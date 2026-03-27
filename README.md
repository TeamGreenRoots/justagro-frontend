# JustAgro Frontend

Next.js 14 client for the JustAgro agricultural payment platform. Three-role fintech application — Farmer, Buyer, Aggregator — integrated with Interswitch for payments and Google Gemini for AI features.

**Live:** https://justagro.vercel.app  
**API:** https://justagro-backend.onrender.com  
**API Docs:** https://justagro-backend.onrender.com/api-docs

---

## Prerequisites

- Node.js 18+
- pnpm / yarn / npm
- JustAgro backend running (see [backend repo](https://github.com/TeamGreenRoots/justagro-backend))

---

## Local Setup

```bash
git clone https://github.com/TeamGreenRoots/justagro-frontend
cd justagro-frontend

yarn install

cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

yarn dev
# http://localhost:3000
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `https://justagro-backend.onrender.com` |

---

## Build and Deploy

```bash
# Type check + production build
yarn build

# Start production server (if self-hosting)
yarn start

# Deploy to Vercel
vercel --prod
```

**Vercel settings:**

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `yarn build` |
| Output Directory | `.next` |
| Install Command | `yarn install` |

After deploy, set `NEXT_PUBLIC_API_URL` in Vercel dashboard under Settings > Environment Variables, then redeploy.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Server state | TanStack Query | 5.x |
| HTTP | Axios | 1.7.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | 0.383.0 |
| Notifications | React Hot Toast | 2.x |
| Cookie storage | js-cookie | 3.x |

---

## Architecture

### Authentication

JWT stored in cookies via js-cookie. Access token (7d), refresh token (30d). Axios interceptor attaches `Authorization: Bearer <token>` to every request. On 401, cookies are cleared and the user is redirected to `/login`.

Role is stored in the user cookie. `getDashboardPath(role)` resolves the correct redirect after login:

```
FARMER     --> /dashboard/farmer
BUYER      --> /dashboard/buyer
AGGREGATOR --> /dashboard/aggregator
```

### Data Fetching

All server state is managed by TanStack Query. Each page uses `useQuery` with specific query keys. Refetch intervals are set on pages that need live data:

- Notifications: 10 second polling (no WebSocket)
- Buyer dashboard: 15 second polling (pending payment status)

### Route Structure

```
app/
  page.tsx                     Redirects to dashboard if authed, else /login
  login/page.tsx
  register/page.tsx             useSearchParams wrapped in Suspense (Next.js 14 requirement)
  browse/page.tsx               Public — no auth, fetches /inventory/browse directly
  pay/[txnRef]/page.tsx         Public — no auth, loads Interswitch script dynamically
  dashboard/
    farmer/
      page.tsx                  Two queries: /farmer/dashboard/me + /transactions
      inventory/page.tsx
      transactions/page.tsx
      withdraw/page.tsx
      notifications/page.tsx
    aggregator/
      page.tsx
      farmers/page.tsx          Farmer list + slide-in detail panel + add stock modal
      transactions/page.tsx     3-step modal: farmer -> produce -> buyer -> confirm
      buyers/page.tsx           Merges platform Buyer accounts + manual BuyerContacts
      inventory/page.tsx
      add-farmer/page.tsx
      notifications/page.tsx
    buyer/
      page.tsx
      notifications/page.tsx
```

---

## Key Implementation Details

### Interswitch Inline Checkout

The `/pay/:txnRef` page is public. No login required — buyers receive this link via WhatsApp/SMS.

Flow:
1. `GET /api/v1/transactions/public/:txnRef` returns transaction data + payment config
2. Interswitch script loaded dynamically via `document.createElement('script')`
3. `window.webpayCheckout(config)` opens the payment popup
4. `onComplete` fires with Interswitch response
5. If `responseCode === "00"` → call `POST /transactions/public/:txnRef/verify`
6. Backend verifies independently via Interswitch `gettransaction.json`
7. Receipt generated, farmer wallet credited

The client callback result is never trusted alone. Server-side verification is always performed.

**Known sandbox constraint:** Interswitch Starter accounts have a per-transaction limit (~2,000 NGN). Amounts above this return `Z4 - Starter Business Type Limit Exceeded`. The pay page handles this explicitly and shows a descriptive error.

**Test cards (sandbox):**

| Card | Number | Expiry | CVV | PIN | OTP |
|---|---|---|---|---|---|
| Verve (recommended) | 5061050254756707864 | 06/26 | 111 | 1111 | none |
| Visa | 4000000000002503 | 03/50 | 11 | 1111 | none |
| Mastercard | 5123450000000008 | 01/39 | 100 | 1111 | 123456 |

### Farmer Withdrawal

`POST /api/v1/farmer/withdraw` calls the Interswitch Payouts API with `singleCall: true` (combined lookup + payout in one request). Bank list is hardcoded in the frontend component — the `/farmer/banks` backend endpoint was unreachable due to route ordering conflicts. Nigerian bank codes do not change, so static is the correct approach.

**Sandbox test account:** `0037320662` / bank code `TRP` — always returns success.

### Buyer Transaction Visibility

Buyers can be assigned to a transaction in two ways:

1. Via `buyerId` — linked to a platform Buyer account
2. Via `buyerContactId` — linked to an aggregator's manual contact

The backend `GET /transactions` for a BUYER role matches using an OR query:

```typescript
where.OR = [
  { buyerId: req.user.buyerId },
  { buyerContact: { phone: user.phone } }
]
```

This means a buyer registered on the platform will see transactions even if the aggregator added them as a manual contact using their phone number.

### Aggregator Buyer List

`GET /buyer-contacts` returns a merged list: platform Buyer accounts (marked `source: "PLATFORM"`) and manual BuyerContacts (marked `source: "CONTACT"`). The transaction creation modal checks the source field to determine whether to send `buyerId` or `buyerContactId` to the API. Sending the wrong field causes a Prisma foreign key constraint error.

### AI Integration

All AI calls go through `GET /api/v1/ai/*`. The backend calls Google Gemini 1.5 Flash, prompts it to return JSON only, strips markdown fences, and parses the response. Every endpoint has a hardcoded fallback object — if Gemini fails, the frontend still renders something sensible.

| Endpoint | Role | Prompt inputs |
|---|---|---|
| `/ai/farmer-advice` | FARMER | Transaction history, wallet balance, inventory count, crop types |
| `/ai/market-summary` | AGGREGATOR | Grouped inventory by crop type, current date |
| `/ai/fraud-check/:id` | AGGREGATOR | Transaction details, farmer history, buyer age |
| `/ai/price-intelligence/:id` | ALL | Crop type, listed price, quantity, location, month |

### PDF Receipt

`printReceipt(receipt)` in `lib/utils.ts` builds a complete HTML document as a string, opens it in a new tab with `window.open()`, and calls `window.print()` on load. The user saves it as PDF using the browser's print dialog. No external PDF library required.

### Notifications

Three delivery channels per event: in-app (database), SMS (Termii), WhatsApp (Termii). During development, all WhatsApp messages are routed to `TEST_WHATSAPP_NUMBER` env var with the real recipient prefixed in the message body.

In-app notifications use polling — `refetchInterval: 10000` on TanStack Query. The unread count badge in the sidebar updates on each poll.

---

## Component Reference

### `DashboardLayout`

Wraps all dashboard pages. Accepts `title` prop. Reads role from cookie to build the correct navigation. Handles mobile drawer. Auth guard — redirects to `/login` if no user in cookie.

### `components/ui/index.tsx`

All shared primitives in one file:

- `Input` — controlled, with label, error, hint
- `Select` — with options array
- `Button` — variant (primary, secondary, danger, ghost, outline), loading state
- `Card` — white rounded container with shadow
- `StatCard` — icon + label + value + optional sub
- `Spinner` — full-page loading state
- `Empty` — empty state with icon
- `Pagination` — page/pages/total/onPage props

### `lib/api.ts`

Axios instance with `baseURL = NEXT_PUBLIC_API_URL/api/v1`. Request interceptor attaches JWT. Response interceptor handles 401 globally.

### `lib/utils.ts`

- `formatNaira(n)` — Intl.NumberFormat NGN
- `formatDate(d)` — short date
- `formatDateTime(d)` — date + time
- `statusColor(status)` — Tailwind class string for transaction/inventory status badges
- `printReceipt(receipt)` — opens print dialog

---

## Known Issues and Workarounds

**`useSearchParams` requires Suspense boundary in Next.js 14**
The register page reads `?role=BUYER` from the URL. Next.js 14 throws a build error if `useSearchParams` is called outside a Suspense boundary during static generation. Fixed by wrapping the page component in `<Suspense>`.

**Farmer dashboard showed empty transactions**
The farmer dashboard endpoint returns `recentTransactions` but the page was reading `farmer.transactions`. Fixed by adding a separate `useQuery` call to `GET /transactions` directly — more reliable and independently cacheable.

**Route ordering in Express**
`GET /:id` in `farmer.routes.ts` was defined before `GET /dashboard/me`, causing Express to match `"dashboard"` as an ID parameter. The dashboard returned farmer detail with empty transaction arrays. Fixed by reordering routes so specific paths come before parameterized ones.

**Duplicate `useState` import**
An earlier patch accidentally introduced a duplicate import, causing a silent compilation error on the farmer dashboard. Removed during rebuild.

**CORS on Render deployment**
The initial CORS config used a static array. Fixed with a function-based origin validator that allows any `*.vercel.app` subdomain (for preview deployments) and any `*.onrender.com` origin.

---

## Demo Accounts

Seed the backend with `yarn db:seed`, then use:

| Role | Phone | Password | Notes |
|---|---|---|---|
| Aggregator | 08000000001 | demo1234 | Full platform access |
| Farmer | 08000000002 | demo1234 | Has stock and transaction history |
| Farmer (offline) | 08033221100 | 08033221100 | Registered by aggregator, no smartphone |
| Farmer (new) | 08000000003 | demo1234 | No transactions, score = 0 |
| Buyer | 08000000004 | demo1234 | Has pending and paid orders |

**Test payment link:** `http://localhost:3000/pay/AGT_1717200000000_0003`

---

## Scripts

```bash
yarn dev          # Development server on :3000
yarn build        # Production build
yarn start        # Start production server
yarn lint         # ESLint
```

---

## Related

- [Backend Repository](https://github.com/TeamGreenRoots/justagro-backend)
- [Interswitch Docs](https://docs.interswitchgroup.com)
- [Termii Docs](https://developers.termii.com)
- [Gemini API](https://ai.google.dev)
- [Neon](https://neon.tech)
  

---

# JustAgro Overview

JustAgro is a transaction transparency platform for agricultural trade.

It is designed to help aggregators, farmers, and buyers record produce deliveries, confirm payments, and generate trusted transaction receipts at the moment trade happens. Instead of depending on verbal confirmation, screenshots, or scattered paper notes, JustAgro creates a clear digital record of each transaction.

The product focuses on one high-friction moment in the agricultural value chain: the point where produce is delivered and payment must be confirmed.

## Problem

Agricultural transactions in informal markets are often difficult to track. Farmers may not receive immediate proof of payment, aggregators struggle to reconcile deliveries with buyer payments, and buyers lack a structured way to document purchases. This creates mistrust, delays, and weak financial records across the supply chain.

## Solution

JustAgro solves this by creating a simple, role-based transaction flow:

- Aggregators log produce deliveries
- Buyers confirm payment for a specific delivery
- The system verifies the transaction and generates a digital receipt
- Transaction history is stored for future reference

The result is a lightweight system that improves transparency, accountability, and trust in agricultural commerce.

## Core Product Flow

1. A farmer delivers produce to an aggregator
2. The aggregator logs the delivery in JustAgro
3. The aggregator selects or adds the buyer linked to that delivery
4. The buyer receives a unique transaction link
5. The buyer confirms payment
6. JustAgro updates the transaction status to paid
7. A receipt is generated and stored for both parties

## Interswitch Integration

JustAgro is built to work with Interswitch payment infrastructure for transaction integration.

The platform uses Interswitch as the payment layer that supports the verification of buyer payments and transaction completion. This makes the product feel real, trustworthy, and connected to production-grade financial rails rather than a purely mock workflow.

In the hackathon MVP, the payment step can be demonstrated through Interswitch sandbox or simulated confirmation logic, depending on available access.

## Key Features

- Delivery logging by aggregators
- Saved buyer list for faster transaction entry
- Unique payment link for each delivery
- Payment status tracking from pending to paid
- Digital receipt generation
- Transaction history for farmers, aggregators, and buyers

## User Roles

### Aggregator
The aggregator is the primary operator of the system. They record the delivery, assign the buyer, and trigger the transaction flow.

### Buyer
The buyer confirms the payment for a recorded delivery using a simple transaction link.

### Farmer
The farmer receives proof that payment was completed and can keep a record of the transaction.

## Team Contributions

### Product Manager — Rita Ntekim
- Defined the product vision and hackathon scope
- Wrote the PRD and refined the core transaction flow
- Owned product direction, prioritization, and execution structure
- Documented user flows and repo organization
- Generated Logo and necessities for brand identity

### Product Manager — Belinda Mahachi
- Led survey generation and user needs validation
- Collected insights that shaped the product direction
- Helped define the core problem and user pain points

### Software Engineer — Michelle Utomi
- Built both frontend and backend for the product
- Implemented the delivery logging and transaction flow
- Created buyer selection and payment confirmation logic
- Integrated and prepared the Interswitch payment layer
- Connected the receipt and transaction history experience
- Handled all UI/UX designs including landing page


## Project Status

MVP in progress for hackathon submission.

## Iteration Log

During development, we identified and resolved several issues that were affecting transaction visibility, routing logic, and verification reliability. These fixes improved the stability of the core user flow and strengthened the integrity of the product.

### Key Fixes Implemented

- **Route ordering corrected**
- 
  We moved `/dashboard/me` and `/profile/me` above the `/:id` route so the app no longer interprets static routes like `dashboard` as dynamic IDs. This fixed an issue where transaction data was not loading correctly for authenticated users.

- **Buyer transaction visibility improved**
- 
  We updated buyer transaction matching logic to use phone number-based mapping in addition to buyer ID. This ensures that buyers linked through `BuyerContact` can now see their associated orders correctly.

- **Credit score calculation corrected**
- 
  We fixed the credit scoring logic so that users with zero transactions now correctly receive a score of `0` instead of an inflated score of `8`. This makes the scoring output more accurate and trustworthy.

- **Interswitch verification fallback refined**
- 
  We updated payment verification logic so sandbox fallback is only triggered on genuine network errors, not on `Z25` responses. This prevents false fallback behavior and keeps payment status handling more reliable.

- **Public inventory route fixed**
- 
  We moved `/browse` ahead of the authentication middleware so the inventory page can load publicly as intended before login is required.

### Product Impact

These fixes improved:

- Transaction visibility
- Buyer order access
- Route reliability
- Payment verification accuracy
- Overall platform trustworthiness

They also helped stabilize the MVP for demo and review purposes.


## Future Improvements

- SMS and WhatsApp delivery of receipts
- USSD support for low-tech users
- Offline-friendly delivery capture
- Analytics dashboard for aggregators
- Expanded payment and reporting features

## Repository Structure

- [`docs/`](docs/) — Contains all product documentation including PRD, user research, competitive analysis, and product decisions  
- [`src/`](src/) — Houses the application codebase (frontend and backend services)  
- [`assets/`](assets/) — Includes system diagrams, flowcharts, and visual references used during development
  

Built by TeamGreenRoots  
Interswitch Hackathon 2026

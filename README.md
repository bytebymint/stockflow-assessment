# StockFlow

StockFlow is a responsive, multi-role inventory and ordering platform built for
the Inventory & Order Management System technical assessment. Administrators
govern categories and supplier access, suppliers manage stock and fulfilment,
and customers browse a public catalog and place multi-supplier orders.

## Live application

- Repository: https://github.com/bytebymint/stockflow-assessment (private during review)
- Deployment: Vercel deployment is intentionally deferred until the final delivery stage
- Database health: `/api/health/database`

### Evaluator accounts

These are assessment-only accounts. The shared password is intentionally
published for evaluation and must not be reused for a real system.

| Role              | Email                     | Password             | Purpose                                                            |
| ----------------- | ------------------------- | -------------------- | ------------------------------------------------------------------ |
| Administrator     | `admin@stockflow.demo`    | `StockFlowDemo!2026` | Categories, supplier approvals, all orders, dashboards and exports |
| Customer          | `customer@stockflow.demo` | `StockFlowDemo!2026` | Cart, checkout, order history and cancellation                     |
| Approved supplier | `supplier@stockflow.demo` | `StockFlowDemo!2026` | Products, stock, assigned orders, dashboard and exports            |
| Pending supplier  | `pending@stockflow.demo`  | `StockFlowDemo!2026` | Supplier approval-state experience                                 |

## What is implemented

### Core requirements

- Email/password authentication for `ADMIN`, `SUPPLIER`, and `CUSTOMER` roles.
- Public categorized product catalog with product-detail pages.
- Admin-only category management with protected deletion rules.
- Supplier product creation, editing, stock management, image upload, and
  archival.
- Multi-supplier cart and atomic checkout with one order per supplier.
- A centralized order workflow with protected transitions and exactly-once
  stock restoration after cancellation.
- Admin and supplier dashboards with operational metrics, low-stock views,
  order charts, revenue summaries, and accessible data tables.
- Signed Cloudinary product-image uploads with type, size, replacement, and
  ownership validation.

### Bonus requirements

- URL-driven search, filters, sorting, and server-side pagination.
- In-app order, low-stock, and supplier-status notifications.
- Admin supplier approval workflow.
- Authorized CSV exports for orders and delivered revenue.
- Tagged caching for public catalog data and role-scoped dashboard aggregates,
  with explicit mutation invalidation.

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- PostgreSQL, Prisma 7, and the PostgreSQL Prisma adapter
- Auth.js credentials authentication and bcrypt password hashing
- Tailwind CSS 4, shadcn-style primitives, Lucide icons, and Recharts
- Cloudinary signed browser uploads
- Zod validation, Vitest, Playwright, and axe-core
- Vercel, Neon PostgreSQL, and Cloudinary for production

## Architecture and business rules

### Authorization

Pages and mutations enforce access on the server. Session claims provide the
initial role, while protected operations reload the current user and supplier
approval state from PostgreSQL. Suppliers can access only their products and
orders; customers can access only their orders; administrators can operate
across the platform.

### Inventory-safe checkout

Checkout runs in a PostgreSQL `SERIALIZABLE` transaction. It revalidates every
product, supplier, price, and requested quantity, then conditionally decrements
stock only when enough inventory remains. Any failed item rolls back the entire
checkout. Serialization conflicts are retried, and an idempotent checkout token
prevents duplicate orders. A successful multi-supplier cart creates one order
per supplier under a shared checkout group.

### Order workflow

Allowed transitions are centralized:

```text
PENDING -> CONFIRMED -> SHIPPED -> DELIVERED
   |           |
   +-----------+-> CANCELLED
```

Customers can cancel only their own pending orders. Approved suppliers can
manage only orders assigned to them. Administrators can perform valid
transitions on any order. Cancellation and stock restoration occur in one
transaction, guarded by `stockRestoredAt`, so stock is restored exactly once.

### Historical integrity

Order items preserve product name, image, and price snapshots. Products are
archived instead of deleted once history must be retained. Money is stored as
`DECIMAL(12,2)`, while database constraints prevent negative inventory and
invalid quantities.

### Caching

Only shared public catalog data and dashboard aggregates are cached. Sessions,
permissions, carts, and personal notifications are never cached. Product,
category, supplier, checkout, and order mutations invalidate the affected tags.

## Local setup

### Prerequisites

- Node.js 22 or later
- npm 10 or later
- PostgreSQL 15 or later
- A Cloudinary account when testing image uploads

### Installation

```bash
git clone https://github.com/bytebymint/stockflow-assessment.git
cd stockflow-assessment
npm install
```

Copy `.env.example` to `.env.local`, then replace every placeholder.

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

### Environment variables

| Variable                         | Required | Description                                                         |
| -------------------------------- | -------- | ------------------------------------------------------------------- |
| `DATABASE_URL`                   | Yes      | Pooled PostgreSQL URL used by the application and seed script       |
| `DIRECT_URL`                     | Yes      | Direct PostgreSQL URL used for migrations                           |
| `TEST_DATABASE_URL`              | Tests    | Dedicated disposable integration/E2E database                       |
| `AUTH_SECRET`                    | Yes      | Long random Auth.js signing secret; generate with `npx auth secret` |
| `CLOUDINARY_CLOUD_NAME`          | Uploads  | Cloudinary product cloud name                                       |
| `CLOUDINARY_API_KEY`             | Uploads  | Cloudinary API key                                                  |
| `CLOUDINARY_API_SECRET`          | Uploads  | Server-only Cloudinary API secret                                   |
| `DEMO_ADMIN_PASSWORD`            | Seed     | Password for the seeded administrator                               |
| `DEMO_CUSTOMER_PASSWORD`         | Seed     | Password for the seeded customer                                    |
| `DEMO_SUPPLIER_PASSWORD`         | Seed     | Password for both seeded approved suppliers                         |
| `DEMO_PENDING_SUPPLIER_PASSWORD` | Seed     | Password for the seeded pending supplier                            |

For the documented evaluator accounts, set all four `DEMO_*_PASSWORD` values
to `StockFlowDemo!2026` before seeding.

### Database setup

```bash
npm run db:validate
npm run db:deploy
npm run db:seed
```

The committed migration creates the required tables, indexes, constraints, and
PostgreSQL trigram search extension. The seed is deterministic and safe to run
repeatedly; it creates users, categories, products, stock levels, orders,
notifications, and dashboard history without duplicating records.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database health check
returns `200` when PostgreSQL is available and `503` without exposing connection
details when it is unavailable.

## Testing and quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
```

Database integration tests require a dedicated `TEST_DATABASE_URL`:

```bash
npm run test:integration
```

The integration runner applies committed migrations and refuses to run if the
test target matches `DATABASE_URL`. It covers successful checkout,
insufficient-stock rollback, simultaneous purchases, non-negative stock,
authorization, supplier approval, valid transitions, and repeated
cancellation.

Playwright tests also require `TEST_DATABASE_URL`:

```bash
npm run test:e2e
```

The browser suite covers public discovery, customer ordering, supplier and
admin workflows, accessibility scans, keyboard focus, reduced motion, 200%
text resizing, and responsive layouts at 375, 768, 1024, and 1440 pixels.

## Deployment

The production design uses Vercel, Neon PostgreSQL, and Cloudinary:

1. Create a Neon database and save both pooled and direct connection strings.
2. Configure all variables from `.env.example` in Vercel. Use the pooled Neon
   URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.
3. Apply the production migration with `npm run db:deploy`.
4. Set the four evaluator passwords and run `npm run db:seed` once.
5. Deploy the repository to Vercel and verify `/api/health/database`.
6. Exercise every evaluator role and verify a signed Cloudinary image upload.

## Project structure

```text
prisma/                  schema, migration, and deterministic seed
src/app/                 App Router pages, server actions, and API routes
src/components/          role workspaces, feature UI, and shared primitives
src/lib/                 business rules, data access, validation, and caching
tests/unit/              validation, authorization, and workflow tests
tests/integration/       PostgreSQL transaction and concurrency tests
tests/e2e/               role journeys and responsive accessibility audit
```

## Assumptions and deliberate shortcuts

- Admin alone manages categories, avoiding competing supplier taxonomies.
- New suppliers start pending and cannot list products until approved.
- The browser cart is local until checkout; the server remains authoritative for
  price, stock, supplier approval, and archive state.
- A cart can span suppliers, but fulfilment remains supplier-specific through
  separate orders in one checkout group.
- Products are archived instead of physically deleted when order history exists.
- Notifications are in-app only; email delivery was intentionally out of scope.
- Payment processing, tax, shipping rates, returns, and address collection were
  not part of the assessment and are not simulated.
- Seeded products use accessible generated placeholders until a supplier uploads
  a Cloudinary image.

## Requirement traceability

| Assessment requirement         | Implementation                                           |
| ------------------------------ | -------------------------------------------------------- |
| Three-role authentication      | Auth.js credentials, server policies, role workspaces    |
| Categorized catalog            | Public catalog and admin category management             |
| Supplier product management    | Owned CRUD, stock updates, archival, image uploads       |
| Atomic non-negative stock      | Serializable checkout and conditional decrements         |
| Status workflow and restocking | Central transition policy and transactional cancellation |
| Two or more admin aggregates   | Metrics, low stock, daily orders, supplier revenue       |
| Product image upload           | Signed Cloudinary upload and verified persistence        |
| Public deployment              | Pending the final, user-approved Vercel delivery stage   |
| Search, filter, pagination     | URL-driven server-side catalog discovery                 |
| Notifications                  | Role-specific in-app notification center                 |
| Supplier approval              | Admin review and protected supplier states               |
| CSV export                     | Role-authorized order and revenue downloads              |
| Basic caching                  | Tagged catalog and role-scoped dashboard caching         |

## Time spent

Approximately **15 hours across two days**:

| Area                                                                           | Approximate time |
| ------------------------------------------------------------------------------ | ---------------: |
| Foundation, design system, data model, seed, and authentication                |          3 hours |
| Catalog, administration, supplier tools, images, discovery, and cart           |          5 hours |
| Checkout, order workflow, notifications, dashboards, exports, and caching      |          4 hours |
| Unit, integration, concurrency, browser, responsive, and accessibility testing |          2 hours |
| Deployment preparation and documentation                                       |           1 hour |

Implementation was intentionally divided into small, reviewable commits, with
each numbered milestone tested and approved before the next began.

# StockFlow

StockFlow is a multi-role inventory and order management platform for administrators, suppliers, and customers. This repository is being built as a take-home technical assessment using small, reviewable commits.

> Current status: role-based authentication, registration, and protected workspace entry points are ready. Product features have not been implemented yet.

## Planned stack

- Next.js App Router and TypeScript
- Tailwind CSS
- PostgreSQL and Prisma
- Auth.js
- Cloudinary
- Vitest and Playwright

## Local development

### Prerequisites

- Node.js 22 or later
- npm 10 or later

### Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Database

Set `DATABASE_URL` to the pooled PostgreSQL connection used by the application. Set `DIRECT_URL` to the direct connection used for migrations; the two values may match for a local PostgreSQL server.

```bash
npm run db:validate
npm run db:migrate
npm run db:seed
```

The database health endpoint is available at `/api/health/database`. It returns `200` when PostgreSQL is reachable and `503` without exposing connection details when it is not.

The seed command requires all four `DEMO_*_PASSWORD` values from `.env`. It creates deterministic assessment records and can be run repeatedly without duplicating them. Passwords are never printed or stored in plain text.

### Authentication

Set `AUTH_SECRET` to a long random value before starting the app. You can generate one with `npx auth secret`.

Customers and suppliers can register through `/register`. Customer accounts are active immediately; new supplier accounts are created with a pending approval state. Administrator registration is intentionally unavailable—the evaluator admin account is created by the seed command.

The deterministic demo emails are:

- `admin@stockflow.demo`
- `customer@stockflow.demo`
- `supplier@stockflow.demo`
- `pending@stockflow.demo`

Their passwords come from the matching `DEMO_*_PASSWORD` environment variables. Protected pages read the current role and supplier status from PostgreSQL rather than trusting session claims alone.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Assessment requirement tracker

- [x] Authentication for admin, supplier, and customer roles
- [ ] Categorized product catalog
- [ ] Supplier product and stock management
- [ ] Atomic ordering without negative stock
- [ ] Validated order-status workflow and cancellation restocking
- [ ] Admin dashboard with at least two aggregate views
- [ ] Supplier-side product image upload
- [ ] Public deployment
- [ ] Search and filtering
- [ ] In-system notifications
- [ ] Supplier approval workflow
- [ ] Pagination
- [ ] CSV export
- [ ] Basic caching

## Assumptions and shortcuts

- Money uses PostgreSQL `DECIMAL(12,2)` values rather than floating-point numbers.
- Product records are archived and protected from deletion once referenced by an order item.
- Categories cannot be deleted while active products use them; archived products remain valid if a category is later removed.
- Order items retain product-name, image, and unit-price snapshots so later catalog changes do not rewrite order history.
- Database checks enforce non-negative inventory, positive prices and quantities, and consistent supplier approval state. Cross-record role checks remain application responsibilities because they span foreign-key records.

## Time log

| Step | Work completed                                        | Time spent                    |
| ---- | ----------------------------------------------------- | ----------------------------- |
| 1    | Project scaffold, tooling, and documentation baseline | To be recorded after approval |

## Deployment

The deployment URL and evaluator demo accounts will be added during the final deployment step.

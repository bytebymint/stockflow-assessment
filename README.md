# StockFlow

StockFlow is a multi-role inventory and order management platform for administrators, suppliers, and customers. This repository is being built as a take-home technical assessment using small, reviewable commits.

> Current status: project foundation only. Product features have not been implemented yet.

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
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Assessment requirement tracker

- [ ] Authentication for admin, supplier, and customer roles
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

Implementation assumptions and any deliberate shortcuts will be recorded here as they are approved.

## Time log

| Step | Work completed                                        | Time spent                    |
| ---- | ----------------------------------------------------- | ----------------------------- |
| 1    | Project scaffold, tooling, and documentation baseline | To be recorded after approval |

## Deployment

The deployment URL and evaluator demo accounts will be added during the final deployment step.

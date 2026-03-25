# SparkMvmt

**[Live Demo →](https://sparkmvmt.com)**

Full-stack exercise tracker where users log, edit, duplicate, and delete workouts through a responsive single-page UI. One-click demo mode lets anyone try it instantly.

React + Vite SPA on S3 + CloudFront, Dockerized Express API on EC2 Auto Scaling Group behind an ALB with ACM TLS termination. Secrets via SSM Parameter Store, IAM role-based ECR auth, JWT token rotation with Argon2, object-level authorization, and an automated test suite.

**Just added:** 120 tests — 91 backend (node:test + supertest + mongodb-memory-server) and 29 E2E (Playwright).

**Up next:** CI/CD via GitHub Actions (test → build → push to ECR → rolling ASG deploy), exercise autocomplete + filtering, and LLM-powered coaching.

## Architecture

```
                     ┌──────────────────────────────────┐
   sparkmvmt.com  →  │          CloudFront CDN          │
                     │     Origin: S3 (frontend/dist)   │
                     └──────────────────────────────────┘

                     ┌──────────────────────────────────┐
api.sparkmvmt.com →  │    ALB (ACM TLS termination)     │
                     └───────────────┬──────────────────┘
                                     │
                     ┌───────────────▼──────────────────┐
                     │     Auto Scaling Group (1-3)     │
                     │     EC2 + Docker → Express :3000 │
                     │     Images pulled from ECR       │
                     │     Secrets from SSM             │
                     └───────────────┬──────────────────┘
                                     │
                     ┌───────────────▼──────────────────┐
                     │         MongoDB Atlas            │
                     └──────────────────────────────────┘

Deploy: docker build → push to ECR → ASG instances pull on boot
```

- **Frontend:** Vite + React SPA deployed to S3, served via CloudFront
- **Backend:** Express + Mongoose in Docker containers on EC2, behind ALB with ACM cert, auto-scaled via ASG
- **Auth:** httpOnly cookie-based refresh tokens, cross-subdomain via `.sparkmvmt.com`
- **Domains:** `sparkmvmt.com` (frontend via CloudFront) · `api.sparkmvmt.com` (backend via ALB)

## Screenshots

![Sign up](docs/01-signup.png)
*Account creation with real-time password validation*

![Welcome](docs/02-home-empty.png)
*Empty state with example row and welcome message*

![Exercise log](docs/04-home-populated.png)
*Home page with logged exercises*

![Log an exercise](docs/03-create-exercise.png)
*Exercise form with bodyweight support*

---

## Features

- **Demo mode** — one-click demo account with ~25 seeded exercises, full CRUD access, auto-deleted after 24h
- Log, edit, duplicate, and delete exercises
- Exercise detail page with optional notes
- Clickable table rows for quick access to details
- Dual save buttons on create: save & return, or save & add another
- Confirm overlays for delete and discard actions
- Bodyweight exercise support
- Responsive desktop and mobile layouts with adaptive date formatting
- Floating action button for quick exercise logging
- Accessible form controls with keyboard navigation
- Real-time form validation with toast feedback
- Session restoration across page reloads with loading states

## Technical Highlights

- JWT access/refresh token rotation — access tokens in memory (never localStorage), refresh tokens in httpOnly cookies
- Argon2 password hashing with input length limits to prevent hash DoS
- Silent token refresh on 401 and session restoration on page load
- Object-level authorization — all exercise queries scoped to the authenticated user
- Rate limiting on auth endpoints, helmet security headers, query parameter whitelisting against NoSQL injection
- Dockerized backend with multi-stage builds (argon2 native compilation in builder, slim production image)
- Express 5 with native async error propagation and central error middleware
- Graceful shutdown on SIGTERM for zero-downtime container deploys
- ECR image pipeline with IAM instance role authentication
- 120 automated tests: 91 backend (node:test + supertest + mongodb-memory-server) and 29 E2E (Playwright)

---

## Project Structure

```
├── frontend/
│   └── src/
│       ├── pages/          # LoginPage, HomePage, ExerciseFormPage, ExerciseDetail
│       ├── components/     # ExerciseForm, ExerciseTable, ExerciseRow, ConfirmOverlay, Toast
│       └── utils/          # API client (token refresh, auth headers), date helpers, useFormError hook
├── backend/
│   ├── app.mjs              # Express app setup (routes, middleware, validation) — importable by tests
│   ├── controller.mjs       # Entry point: connects DB, starts server
│   ├── auth.mjs             # Signup, login, refresh, logout, demo account creation
│   ├── middleware.mjs        # Auth middleware, ObjectId validation
│   ├── model.mjs            # Exercise schema (name, reps, weight, unit, date, notes)
│   ├── userModel.mjs        # User schema (with demo TTL support)
│   ├── benchmark.mjs        # CPU-bound load test endpoint (synthetic LLM coaching profiles)
│   ├── demoSeed.mjs         # Seed data generator for demo accounts
│   ├── tests/               # Backend test suite (node:test + supertest + mongodb-memory-server)
│   │   ├── setup.mjs        # In-memory MongoDB, test helpers
│   │   ├── validation.test.mjs  # Input validation unit tests (30 tests)
│   │   ├── auth.test.mjs        # Auth API integration tests (27 tests)
│   │   └── exercises.test.mjs   # Exercise CRUD integration tests (34 tests)
│   ├── Dockerfile            # Multi-stage build (Node 24 Alpine, argon2 native deps)
│   ├── compose.yaml          # Local container testing
│   ├── k6-benchmark.js      # k6 load test script
│   └── user-data.sh         # EC2 bootstrap: pull image from ECR, fetch secrets from SSM
├── e2e/
│   ├── tests/               # Playwright E2E tests (29 tests)
│   │   ├── auth.spec.mjs    # Auth flows, demo mode, session restore
│   │   ├── exercises-crud.spec.mjs  # CRUD, duplicate, discard guard, delete cancel
│   │   ├── form-validation.spec.mjs # Form + signup validation
│   │   └── helpers.mjs      # Shared selectors and test utilities
│   └── playwright.config.mjs
```

---

## Running Locally

```bash
cp backend/.env.example backend/.env    # add your MongoDB URI and JWT secrets
npm run install:all
npm run dev
```

Starts both backend (nodemon, port 3000) and frontend (Vite, port 5173) with a single command. The Vite dev server proxies `/api` requests to the backend automatically.

You'll need:
- **Node.js** 24+
- **MongoDB** connection string — [MongoDB Atlas](https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string) offers a free tier
- **JWT secrets** — generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Testing

```bash
cd backend && npm test              # 91 backend tests (~4s)
cd e2e && npm test       # 29 E2E tests (~24s, needs servers running)
```

**Backend tests** use an in-memory MongoDB (mongodb-memory-server) — no external database needed. Covers input validation, auth flows, exercise CRUD, user isolation, and malformed ID handling.

**E2E tests** use Playwright against running dev servers. Covers auth, full CRUD, form validation, demo mode, discard guards, and session persistence.

### API Testing (manual)

The included `test-requests.http` file covers all endpoints. Use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension to send requests directly from the file.

## Production Deployment

### Frontend (S3 + CloudFront)

1. Build the frontend: `cd frontend && npm run build`
2. Sync `dist/` to your S3 bucket (static website hosting enabled)
3. CloudFront distribution points to the S3 origin with `index.html` as the default root object and error page (for SPA routing)
4. `sparkmvmt.com` DNS points to the CloudFront distribution

### Backend (ALB + ASG + Docker + ECR)

1. Build and push the Docker image: `docker build` → `docker push` to ECR
2. ASG launches EC2 instances from a launch template with user data that pulls the image from ECR and fetches secrets from SSM Parameter Store
3. ALB terminates TLS (ACM cert), routes traffic to healthy instances via target group health checks on `/health`
4. Auto Scaling Group maintains 1-3 instances based on CPU utilization

### Environment Variables (Production)

| Variable | Description |
|---|---|
| `NODE_ENV` | Must be `production` (enforces secure cookies, requires JWT secrets) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | Random 64-byte hex string for signing access JWTs |
| `REFRESH_TOKEN_SECRET` | Random 64-byte hex string for signing refresh JWTs |
| `CORS_ORIGIN` | Frontend URL, e.g. `https://sparkmvmt.com` |
| `DEMO_READ_ONLY` | Set to `true` to disable write operations |

---

## Design Decisions

### Auth Architecture
Short-lived access tokens held in memory, long-lived refresh tokens in httpOnly cookies. Access tokens are never persisted to localStorage to limit XSS exposure.

Argon2 over bcrypt for password hashing due to resistance to GPU-based attacks. Input length limits prevent hash-based DoS. The frontend API client handles silent token refresh on 401 and session restoration on page load, so users stay logged in across tabs without tokens in storage.

### Demo Mode
Clicking "Try the demo" creates a throwaway user with ~25 realistic seeded exercises spread across the last few weeks. Demo users get full CRUD access — the experience is identical to a real account. Both the user and their exercises have a `demoExpiresAt` field with a MongoDB TTL index, so they're automatically cleaned up after 24 hours with zero maintenance.

### Accessibility
Button elements for all actions, `aria-label` on icon buttons, preserved focus states for keyboard navigation.

---

## Roadmap

- CI/CD pipeline (GitHub Actions → test → ECR → ASG rolling deploy)
- Email verification and password reset (SES or SendGrid)
- Exercise name autocomplete
- Workout grouping (multiple exercises per session)
- Support for distance, time-based, and freeform activities (runs, hikes, classes)
- Workout planning with completion tracking and rep reporting
- Post-workout reflection (how it felt)
- Exercise recommendations based on training history
- Stripe integration for premium features

**Long-term vision:** LLM-powered coaching — build a plan, get feedback on a session, and talk through what's next. The goal is for users to come here not just to log, but for help getting moving.

---

## License

MIT License

---

## Author

Quinn Redwoods

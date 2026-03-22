# SparkMvmt

**[Live Demo →](https://sparkmvmt.com)**

Full-stack exercise tracker with JWT token rotation, httpOnly cookie auth, and Argon2 password hashing.

Built with React, Vite, Express, and MongoDB. Users can log, edit, duplicate, and delete workouts through a responsive single-page UI.

## Architecture

```
                  ┌──────────────────────────────┐
                  │        CloudFront CDN         │
  sparkmvmt.com → │   Origin: S3 (frontend/dist)  │
                  └──────────────────────────────┘

                  ┌──────────────────────────────┐
                  │        EC2 Instance           │
api.sparkmvmt.com│  Nginx → PM2 → Express :3000  │
        →        │  TLS via Certbot (Let's Encrypt)│
                  └──────────┬───────────────────┘
                             │
                  ┌──────────▼───────────────────┐
                  │      MongoDB Atlas            │
                  └──────────────────────────────┘
```

- **Frontend:** Vite + React SPA deployed to S3, served via CloudFront
- **Backend:** Express + Mongoose on EC2, behind Nginx reverse proxy, managed by PM2
- **Auth:** httpOnly cookie-based refresh tokens, cross-subdomain via `.sparkmvmt.com`
- **Domains:** `sparkmvmt.com` (frontend via CloudFront) · `api.sparkmvmt.com` (backend via EC2)

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

- JWT access/refresh token rotation with httpOnly cookie storage
- Argon2 password hashing with input length limits
- Silent token refresh on 401 and session restoration on page load
- Object-level authorization — all exercise queries scoped to the authenticated user
- RESTful API with protected routes and middleware auth
- Production: S3 + CloudFront (frontend), EC2 + Nginx + PM2 (backend), HTTPS via Certbot
- Cross-subdomain auth cookies scoped to `.sparkmvmt.com`

---

## Project Structure

```
├── frontend/
│   └── src/
│       ├── pages/          # LoginPage, HomePage, ExerciseFormPage, ExerciseDetail
│       ├── components/     # ExerciseForm, ExerciseTable, ExerciseRow, ConfirmOverlay, Toast
│       └── utils/          # API client (token refresh, auth headers), date helpers, useFormError hook
├── backend/
│   ├── controller.mjs      # Express app, exercise CRUD routes
│   ├── auth.mjs            # Signup, login, refresh, logout, demo account creation
│   ├── demoSeed.mjs        # Seed data generator for demo accounts
│   ├── middleware.mjs       # Auth middleware (token verification)
│   ├── model.mjs           # Exercise schema (name, reps, weight, unit, date, notes)
│   └── userModel.mjs       # User schema (with demo TTL support)
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
- **Node.js** 18+
- **MongoDB** connection string — [MongoDB Atlas](https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string) offers a free tier
- **JWT secrets** — generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### API Testing

The included `test-requests.http` file covers all endpoints. Use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension to send requests directly from the file.

## Production Deployment

### Frontend (S3 + CloudFront)

1. Build the frontend: `cd frontend && npm run build`
2. Sync `dist/` to your S3 bucket (static website hosting enabled)
3. CloudFront distribution points to the S3 origin with `index.html` as the default root object and error page (for SPA routing)
4. `sparkmvmt.com` DNS points to the CloudFront distribution

### Backend (EC2 + Nginx + PM2)

1. On the EC2 instance, clone the repo and install backend dependencies
2. Set production environment variables (or use AWS Secrets Manager):
   - `NODE_ENV=production`
   - `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
   - `CORS_ORIGIN=https://sparkmvmt.com`
3. Start with PM2: `pm2 start backend/controller.mjs --name exercisetracker`
4. Nginx reverse proxies `api.sparkmvmt.com` → `localhost:3000`
5. TLS via Certbot (Let's Encrypt) on the Nginx layer

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

- ALB + Auto Scaling for backend
- Email verification and password reset (SES or SendGrid)
- Exercise name autocomplete
- Workout grouping (multiple exercises per session)
- Support for distance, time-based, and freeform activities (runs, hikes, classes)
- Workout planning with completion tracking and rep reporting
- Post-workout reflection (how it felt)
- Exercise recommendations based on training history
- Stripe integration for premium features

**Long-term vision:** LLM-powered coaching — build a plan, get feedback on a session, and talk through what's next. The goal is for users to come here not just to log, but to move.

---

## License

MIT License

---

## Author

Quinn Redwoods

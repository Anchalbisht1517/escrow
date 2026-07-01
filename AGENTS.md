# Project: Allie — Escrow Freelance Marketplace

## What this is
A freelance marketplace (like Upwork) where clients post projects, freelancers bid,
and payments move through an in-app wallet + escrow system before later integrating
real money via Razorpay. Built partly for portfolio/interview purposes — code should
be clean and explainable, not just functional.

---

## Tech Stack
- **Runtime**: Node.js (ES Modules — `"type": "module"` in package.json)
- **Framework**: Express v5 (not v4 — relevant for read-only `req.query`/`req.params` behaviour; see note below)
- **Database**: MongoDB via Mongoose v9
- **Auth**: JWT (access token 15m + refresh token 7d), stored as `httpOnly` cookies. RBAC via `restrictTo`, ABAC via `isProjectParticipant`.
- **File Uploads**: Multer (local disk storage to `uploads/avatars/` and `uploads/resumes/`)
- **Email**: Nodemailer (email verification + password reset)
- **Security**: `helmet`, `cors`, `express-rate-limit`, `mongo-sanitize` (custom middleware workaround — see note below)
- **Frontend**: Not yet built. React assumed when the time comes.
- **Payment (future)**: Razorpay — not integrated yet. Wallet top-up and withdrawal are currently manual/fake stubs.
- **AI (future)**: Under consideration — see "Pending Decisions" section. Do NOT build until confirmed.

> **Express v5 note**: `req.query` and `req.params` are read-only getters in Express v5.
> The `mongo-sanitize` middleware in `server.js` works around this by spreading into a new object,
> sanitizing it, and then writing back key-by-key. Do not refactor this to a naive `req.query = mongoSanitize(req.query)` reassignment — it will silently fail in Express v5.

---

## Architecture Rules (do not violate)

1. **Three-layer auth middleware chain**: `protect` (JWT) → `restrictTo` (RBAC) → `isProjectParticipant` (ABAC).
   - `protect`: validates JWT from `req.cookies.accessToken`, fetches user from DB (excluding password), attaches to `req.user`. Also blocks inactive users (`isActive: false`).
   - `restrictTo(...roles)`: checks `req.user.role` against the allowed roles list.
   - `isProjectParticipant`: queries the project by `req.params.id`, checks if the requester is the `client` or the `hiredFreelancer`, then attaches `req.project`. Controllers that come after this middleware do NOT re-fetch the project.

2. **Wallet balance changes MUST always push a `transactionHistory` entry** with `{ amount, type: 'credit'|'debit', description, date }`. No silent balance mutations. Every place that touches `walletBalance` must pair it with a push to `transactionHistory`.

3. **Escrow status must always be one of**: `none` | `locked` | `released` | `refunded`. Never set it to any other value.

4. **Sequential save pattern (not Mongoose transactions)**: Local dev has no replica set, so multi-document operations are done sequentially with individual `.save()` calls. Do not introduce `session.withTransaction()` unless a replica set is confirmed in the environment.

5. **Validation checks before DB mutations**: All guard clauses (existence checks, role checks, status checks, balance checks) must complete before any document is mutated. Only after all checks pass do we write to the DB.

6. **Two-tier project visibility**:
   - **Public tier** (`.select('-privateDetails')`): visible to any authenticated user. Contains title, description, budget, skills, bids count, status, escrow info, populated client name.
   - **Private tier** (full document): only accessible to the owning client or the hired freelancer, enforced by `isProjectParticipant`. Contains `privateDetails` (contractDocument, milestoneTracker, NDA, companyInternalNotes).

7. **Response shape is always** `{ success: boolean, message: string, data: object | null }`. All error responses include `data: null`. Never break this contract.

---

## Data Models (current state)

### `User` — `models/User.js`
| Field | Type | Notes |
|---|---|---|
| `firstName`, `lastName` | String | Required |
| `name` | String | Auto-derived from first+last via `pre('save')` hook |
| `email` | String | Unique, lowercase, trimmed. Required. |
| `password` | String | Bcrypt-hashed (salt=10) via `pre('save')` hook. Only re-hashes when modified. |
| `role` | `'client' \| 'freelancer' \| 'admin'` | Required, indexed |
| `walletBalance` | Number | Default 0 |
| `isActive` | Boolean | Default `true`. Inactive users blocked at `protect` middleware. |
| `isVerified` | Boolean | Default `false`. Must be `true` to log in. Set by email verification flow. |
| `avatar` | String | Local path, e.g., `/uploads/avatars/avatar-xxx.jpg` |
| `avatarPublicId` | String | Filename only, kept for reference |
| `transactionHistory` | Array | `[{ amount, type: 'credit'\|'debit', description, date }]` — embedded, unbounded |
| `clientInfo` | Object | `{ companyName, companyDesc }` |
| `freelancerInfo` | Object | `{ skills[], bio, experience, hourlyRate, portfolioLinks[], resume: { public_id, url }, rating, reviews[] }` |
| `freelancerInfo.reviews[]` | Array | `[{ fromUser (ref User), rating (1–5), comment, createdAt }]` |
| `avgRating`, `totalReviews` | Number | Top-level rating fields (⚠️ `freelancerInfo.rating` also exists — potential duplication, not yet resolved) |
| `bio`, `portfolio` | String / Array | Top-level fields (⚠️ `freelancerInfo.bio` also exists — potential duplication) |
| `passwordResetToken` | String | SHA-256 hashed token, indexed |
| `passwordResetExpires` | Date | 10-minute expiry window |
| `address`, `city`, `zipCode`, `phoneNo` | String | Optional contact fields |

### `Project` — `models/Project.js`
| Field | Type | Notes |
|---|---|---|
| `client` | ObjectId (ref User) | Required, indexed |
| `hiredFreelancer` | ObjectId (ref User) | Default `null`, indexed |
| `title`, `description` | String | Required |
| `budgetMin`, `budgetMax` | Number | Required |
| `budgetType` | `'fixed' \| 'hourly'` | Required |
| `skillsRequired` | `[String]` | Default `[]` |
| `deadline` | Date | Optional |
| `totalBids` | Number | Auto-incremented on `placeBid`, decremented on `withdrawBid` |
| `acceptedBidId` | ObjectId (ref Bid) | Set when a bid is accepted |
| `status` | `'open' \| 'in-progress' \| 'completed' \| 'cancelled'` | Default `'open'`, indexed |
| `escrowAmount` | Number | Default 0. Set to bid amount when bid is accepted. |
| `escrowStatus` | `'none' \| 'locked' \| 'released' \| 'refunded'` | Default `'none'` |
| `privateDetails` | Object | `{ contractDocument, milestoneTracker, nda, companyInternalNotes }` — each file field has `{ public_id, url }` |

### `Bid` — `models/Bid.js`
| Field | Type | Notes |
|---|---|---|
| `project` | ObjectId (ref Project) | Required, indexed |
| `freelancer` | ObjectId (ref User) | Required, indexed |
| `amount` | Number | Required |
| `estimatedDays` | Number | Required |
| `coverLetter` | String | Required |
| `status` | `'pending' \| 'accepted' \| 'rejected' \| 'withdrawn'` | Default `'pending'` |
| Compound index | `{ project: 1, freelancer: 1 }` unique | Prevents a freelancer from bidding twice on the same project |

---

## Routes Implemented So Far

### Auth Routes — `/api/auth` → `routes/userRoute.js`
| Method | Path | Middleware | Controller | Notes |
|---|---|---|---|---|
| POST | `/register` | — | `register` | Creates user, sends verification email. Does NOT log in. |
| GET | `/verify-email` | — | `verifyEmailController` | Token passed as query param |
| POST | `/login` | — | `login` | Sets access + refresh token cookies |
| POST | `/refresh` | — | `refresh` | Issues new access token from refresh cookie |
| POST | `/logout` | `protect` | `logout` | Clears both cookies |
| GET | `/me` | `protect` | `getMe` | Returns `req.user` |
| POST | `/forgot-password` | — | `forgotPassword` | Sends reset email with hashed token |
| POST | `/reset-password/:token` | — | `resetPassword` | Validates token, sets new password, triggers pre-save hash |
| GET | `/client/profile` | `protect`, `restrictTo('client')` | `getUserProfile` | Returns `req.user` |
| GET | `/freelancer/profile` | `protect`, `restrictTo('freelancer')` | `getUserProfile` | Returns `req.user` |
| POST | `/avatar` | `protect`, multer | `uploadAvatar` | Deletes old file, saves new path |
| PUT | `/avatar` | `protect`, multer | `uploadAvatar` | Same as POST — idempotent upsert |
| DELETE | `/deleteAvatar` | `protect` | `deleteAvatar` | Removes local file, clears field |
| POST | `/resume` | `protect`, `restrictTo('freelancer')`, multer | `uploadResume` | PDF only, 5MB limit |
| DELETE | `/resume` | `protect`, `restrictTo('freelancer')` | `deleteResume` | Removes local file |

### User/Wallet Routes — `/api/users` → `routes/usersRoute.js`
| Method | Path | Middleware | Controller | Notes |
|---|---|---|---|---|
| GET | `/wallet` | `protect` | `getUserWallet` | Returns `walletBalance` + `transactionHistory` |
| POST | `/wallet/topup` | `protect`, `restrictTo('client')` | `topUpWallet` | **Fake stub** — no real payment. Razorpay later. |
| POST | `/wallet/withdraw` | `protect`, `restrictTo('freelancer')` | `withdrawFromWallet` | **Fake stub** — no real payout. Razorpay later. |
| GET | `/:id/profile` | — (public, no auth) | `getUserPublicProfile` | No auth required |

### Project Routes — `/api/projects` → `routes/projectRoute.js`
| Method | Path | Middleware | Controller | Notes |
|---|---|---|---|---|
| GET | `/` | `protect` | `listProjects` | Pagination + filtering: `?skills=react,node&budgetMin=500&budgetMax=5000&search=ecommerce&page=1&limit=10` |
| GET | `/:id/public` | `protect` | `getPublicProject` | Excludes `privateDetails` |
| GET | `/:id/private` | `protect`, `restrictTo('client','freelancer')`, `isProjectParticipant` | `getPrivateProject` | Full doc including `privateDetails` |
| POST | `/` | `protect`, `restrictTo('client')` | `createProject` | |
| PUT | `/:id` | `protect`, `restrictTo('client')` | `editProject` | Only allowed when `status === 'open'` |
| DELETE | `/:id` | `protect`, `restrictTo('client')`, `isProjectParticipant` | `cancelProject` | Auto-refunds escrow if locked |
| PATCH | `/:id/complete` | `protect`, `restrictTo('client')`, `isProjectParticipant` | `completeProject` | Releases locked escrow to freelancer |
| PATCH | `/:id/hire` | `protect`, `restrictTo('client')`, `isProjectParticipant` | `hireFreelancer` | ⚠️ Legacy path — sets `hiredFreelancer` + `status` but does NOT lock escrow. See "In Progress" note. |

### Bid Routes — `/api/bids` → `routes/bidRoute.js`
| Method | Path | Middleware | Controller | Notes |
|---|---|---|---|---|
| POST | `/:id/place` | `protect`, `restrictTo('freelancer')` | `placeBid` | `:id` = projectId. Body: `{ projectId, amount, coverLetter, estimatedDays }` |
| GET | `/:id/all` | `protect`, `restrictTo('client')`, `isProjectParticipant` | `getProjectBids` | Sorted by amount ascending (lowest bid first) |
| PATCH | `/:id/accept` | `protect`, `restrictTo('client')`, `isProjectParticipant` | `acceptBid` | Locks escrow, sets `hiredFreelancer`, rejects all other bids atomically |
| PUT | `/bid/:bidId` | `protect`, `restrictTo('freelancer')` | `editBid` | Only when `status === 'pending'`. Whitelisted fields: `amount`, `coverLetter`, `estimatedDays`. |
| DELETE | `/bid/:bidId` | `protect`, `restrictTo('freelancer')` | `withdrawBid` | Only when `status === 'pending'`. Decrements `totalBids`. |
| PATCH | `/bid/:bidId/reject` | `protect`, `restrictTo('client')` | `rejectBid` | Only when `status === 'pending'`. |

---

## Completed Features

- [x] **User registration** with email verification (Nodemailer, JWT-signed verification token)
- [x] **Login / logout** with httpOnly access + refresh token cookies
- [x] **Token refresh** endpoint (`/api/auth/refresh`)
- [x] **Password reset** via email (crypto token, SHA-256 hashed in DB, 10-minute expiry)
- [x] **RBAC** (client / freelancer / admin roles) enforced via `restrictTo` middleware
- [x] **Avatar upload/delete** (local disk, JPG/PNG/WEBP, 2MB limit)
- [x] **Resume upload/delete** (local disk, PDF only, 5MB limit, freelancers only)
- [x] **Project CRUD**: create, list with pagination + filtering, get public info, get private info, edit, cancel
- [x] **Full bid lifecycle**: place, view all (client only), edit own, withdraw own, client reject individual
- [x] **Escrow lock on bid acceptance**: client wallet debited, `escrowAmount` set, `escrowStatus='locked'`, all other bids auto-rejected, `hiredFreelancer` set
- [x] **Escrow release on project completion**: `escrowAmount` credited to freelancer wallet, `status='completed'`, `escrowStatus='released'`
- [x] **Escrow refund on project cancellation**: funds returned to client wallet if locked, `escrowStatus='refunded'`, all pending bids rejected
- [x] **Wallet top-up** (manual/fake stub — clients only)
- [x] **Wallet withdrawal** (manual/fake stub — freelancers only)
- [x] **Public user profile** endpoint (no auth required)
- [x] **Rate limiting**: global 100 req/15min, auth routes 1000 req/15min (relaxed for dev)
- [x] **Security headers** via `helmet`
- [x] **NoSQL injection sanitization** via `mongo-sanitize` with Express v5 workaround

---

## In Progress / Not Yet Built

- [ ] **Profile update endpoint** — no route or controller exists for updating `freelancerInfo` fields (skills, bio, hourlyRate, experience, portfolioLinks). Users cannot edit their own profile data beyond avatar/resume.
- [ ] **Admin routes** — `isAdmin` middleware exists in `authMiddleware.js` but no admin-specific routes or controllers are wired up.
- [ ] **Razorpay payment integration** — wallet top-up and withdrawal are currently fake stubs with "Razorpay later" comments. No real payment flow.
- [ ] **Reviews and ratings** — `freelancerInfo.reviews[]` is defined in the schema but no route/controller exists to submit, list, or aggregate reviews.
- [ ] **`hireFreelancer` route vs `acceptBid` route** — `PATCH /api/projects/:id/hire` sets `hiredFreelancer` and `status='in-progress'` but does NOT lock escrow. This is inconsistent with `acceptBid` which does everything atomically. This route should either be removed or restricted. Do not use it as the canonical hire path.
- [ ] **Milestone tracker / contract document / NDA upload** — `privateDetails` fields exist in the schema but no routes exist to upload or update these files.
- [ ] **Frontend** — not started.
- [ ] **`asyncHandler` utility** — `utils/asyncHandler.js` exists but is **not used anywhere** in the codebase. All controllers use bare `try/catch`. Should be adopted consistently or removed. Do not assume it is in use.
- [ ] **`companyName` populate bug** — `getPublicProject` populates `client` with the select string `'firstName lastName companyName'`. However, `companyName` is nested inside `clientInfo.companyName`, not top-level. This select will silently not return `companyName`. Latent bug — needs fix when profile data matters to the frontend.
- [ ] **Transaction history pagination** — `User.transactionHistory` is an unbounded embedded array with no pagination. Will eventually hit MongoDB's 16MB document size limit.

---

## Pending Decisions (NOT finalized — needs team discussion before building)

> **Do not implement anything in this section until explicitly confirmed by both team members.**

### AI Feature Integration
Under consideration:
1. AI-generated bid/proposal drafts for freelancers
2. AI-based fraud/scam detection on new project postings

Both would use Gemini 2.5 Flash (free tier) via simple prompt calls — no ML training involved.
**Neither has been discussed with the teammate yet. Do not start implementing AI features until this is confirmed by both team members.**

### Security Deposit from Freelancers
Considered and **REJECTED for now** by one team member — reasoning: creates a barrier to entry for freelancer acquisition on a new platform. Proposed replacement: a simple reputation system using `completedProjectsCount` / `abandonedProjectsCount` fields on the User model.
**This decision has also NOT yet been discussed with the partner who originally proposed the deposit idea. Do not add reputation fields to the model or remove the deposit idea from discussion until both team members agree.**

---

## Conventions

### Controller Pattern
- All controllers are `async (req, res) => { try { ... } catch (error) { return res.status(500).json(...) } }`
- Response shape: `{ success: boolean, message: string, data: object | null }`
- Controllers that follow `isProjectParticipant` middleware use `req.project` directly — do NOT re-query the DB for the same project

### Middleware Chain Order
```
protect → restrictTo(...roles) → isProjectParticipant → controller
```
Each layer is optional depending on the route's requirements.

### Token Strategy
- Access token: 15 minutes, env var `SECRET_KEY`
- Refresh token: 7 days, env var `REFRESH_SECRET`
- Both delivered as `httpOnly`, `sameSite: 'strict'` cookies
- `secure: true` only in production (`NODE_ENV === 'production'`)

### File Storage
- Files stored locally in `uploads/avatars/` and `uploads/resumes/`
- Filenames: `avatar-{timestamp}-{random}.{ext}` and `resume-{timestamp}-{random}.{ext}`
- Old files are deleted from disk before saving new ones (in upload handlers)
- No Cloudinary or S3 — purely local disk for now

### Environment Variables Required
```
PORT
MONGO_URI
SECRET_KEY        # JWT access token secret
REFRESH_SECRET    # JWT refresh token secret
NODE_ENV
FRONTEND_URL      # used for CORS in production
```
Additional email-related env vars are required by Nodemailer in `emailVerify/verifyEmail.js`.

### Route File Split
Two separate user-related route files:
- `routes/userRoute.js` → mounted at `/api/auth` — handles auth, profile reads, file uploads
- `routes/usersRoute.js` → mounted at `/api/users` — handles wallet and public profile by ID

---

## Important Context for AI Agents

1. **The escrow/wallet flow was designed deliberately**: money locks on bid acceptance (`acceptBid`), releases on project completion (`completeProject`), refunds on cancellation (`cancelProject`). Do not change this flow without explicit instruction.
2. **`PATCH /api/projects/:id/hire` is NOT the canonical hire path** — it does not lock escrow. The correct hire path is `PATCH /api/bids/:id/accept`. The hire route may be removed or restricted later.
3. **`asyncHandler` is defined but unused** — do not migrate controllers to it unless asked. The inconsistency is known and not an emergency.
4. **No Mongoose transactions** — local dev has no replica set. Sequential `.save()` calls are intentional.
5. **Manual wallet top-up is not real money** — it just increments a DB number. All Razorpay references in the codebase are forward-looking comments, not working integrations.
6. **Two pending decisions above involve a teammate** — treat them as open questions, not committed roadmap items, until this file is updated to say otherwise.
7. **This project is for portfolio/interview purposes** — prioritize clean, readable, explainable code over brevity or cleverness.

---

## CHANGELOG

## 2026-06-30 — AGENTS.md created — Initial persistent memory document
Full codebase scan performed across all models, routes, controllers, middleware, utils, and config files.
Document captures the current state of the project as of this date, including known issues (latent `companyName` populate bug, `asyncHandler` unused, `hireFreelancer` vs `acceptBid` inconsistency), pending decisions (AI features, security deposit), and all architecture rules.
Previous AGENTS.md existed with corrupted/garbled lines and inaccuracies — replaced entirely with this scan-based version.

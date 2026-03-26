# CareerPrepHub

This project now uses a **full-stack setup**:

- Frontend: static HTML/CSS/JS in `frontend/`
- Backend: Node.js + Express + MongoDB in `backend/`

## Backend structure

```text
backend/
  src/
    config/
      constants.js
      db.js
    controllers/
      auth.controller.js
      question.controller.js
    middleware/
      asyncHandler.middleware.js
      auth.middleware.js
      error.middleware.js
      premium.middleware.js
    models/
      aptitudeQuestion.model.js
      codingQuestion.model.js
      otp.model.js
      progress.model.js
      user.model.js
    routes/
      auth.routes.js
      question.routes.js
    services/
      auth.service.js
      question.service.js
      user.service.js
      payment.service.js
    utils/
      generateToken.js
      otpGenerator.js
      apiResponse.js
    app.js
  scripts/
    seed.js
  server.js
  .env.example
  package.json
```

## API endpoints

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

### Questions
- `GET /api/aptitude`
  - Supports query params: `topic`, `difficulty`
- `GET /api/aptitude/:topic`
  - Supports query param: `difficulty`
- `GET /api/coding`
  - Supports query params: `topic`, `difficulty`
- `GET /api/questions/:id`
  - Accepts Mongo `_id` or legacy numeric ID for coding questions

> Hard-question protection (bonus): hard questions require JWT user with `role=paid/admin` or `isPremium=true`.

> Architecture flow: `Route -> Controller -> Service -> Model`

## Environment setup

1. Copy env file:

```bash
cd backend
copy .env.example .env
```

2. Update `backend/.env` values:
- `MONGODB_URI`
- `JWT_SECRET`

## Run backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Server runs at: `http://localhost:5000`

## Run frontend

Use any static server for `frontend/` (for example VS Code Live Server), then open:

- `frontend/pages/home.html`

Frontend data now comes from backend APIs (not JSON files for aptitude/coding datasets).

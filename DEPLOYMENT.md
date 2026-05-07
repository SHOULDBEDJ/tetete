# Deployment Guide - 16 Eyes Farm House

This project consists of two main parts: the **Frontend (Next.js)** and the **Backend (Express.js)**. Both are designed to be deployed independently, ideally on **Vercel**.

## 1. Prerequisites
- A **Turso** database (create one at [turso.tech](https://turso.tech)).
- Turso `DATABASE_URL` and `DATABASE_AUTH_TOKEN`.
- A Vercel account.

---

## 2. Backend Deployment (Express.js)

The backend provides the API and handles database communication via Prisma.

### Step 1: Environment Variables
Configure the following environment variables in your Vercel project settings:
- `DATABASE_URL`: Your Turso connection URL (e.g., `libsql://your-db.turso.io`).
- `DATABASE_AUTH_TOKEN`: Your Turso auth token.
- `JWT_SECRET`: A long random string for signing tokens.
- `FRONTEND_URL`: The URL where your frontend will be deployed (e.g., `https://your-app.vercel.app`).
- `PORT`: Usually handled by Vercel, but set to `3001` for local dev.

### Step 2: Deployment
1. Connect your repository to Vercel.
2. Set the **Root Directory** to `backend`.
3. Vercel should automatically detect the `npm run build` and `npm start` scripts.
4. Ensure `npx prisma generate` runs during the build step. You can update the build command to: `prisma generate && tsc`.

---

## 3. Frontend Deployment (Next.js)

The frontend is the user interface that connects to the backend API.

### Step 1: Environment Variables
Configure the following environment variables in your Vercel project settings:
- `AUTH_SECRET`: Generate one using `npx auth secret`.
- `NEXT_PUBLIC_API_URL`: The URL of your **deployed backend** (e.g., `https://your-api.vercel.app`).
- `NEXTAUTH_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`).

### Step 2: Deployment
1. Connect your repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Vercel will detect Next.js and handle the build automatically.

---

## 4. Post-Deployment Checklist
- [ ] Run `npx prisma db push` from the `backend` folder to ensure the Turso schema is up to date.
- [ ] Create an initial admin user or run your data migration/seeding script.
- [ ] Verify that the frontend `NEXT_PUBLIC_API_URL` correctly points to the live backend.
- [ ] Verify that the backend `FRONTEND_URL` correctly matches the live frontend (to allow CORS).

---

## Local Development
1. Start Backend: `cd backend && npm run dev` (Runs on port 3001)
2. Start Frontend: `cd frontend && npm run dev` (Runs on port 3000)

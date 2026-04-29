# 🚀 Aria Deployment Guide (Render)

This guide will help you deploy Aria to Render as a full-stack application.

## Prerequisites
1. A [GitHub](https://github.com) account with your code pushed to a repository.
2. A [Render](https://render.com) account.
3. Your **OpenAI API Key** and **Upstash Redis URL**.

## Step 1: Prepare the Code
I have already added the following files to your project:
- `render.yaml`: A "Blueprint" that tells Render how to set up both the frontend and backend.
- `requirements.txt`: Updated with `gunicorn` for production.
- `database.py`: Updated to support persistent storage paths.

## Step 2: Connect to Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and show you the services to be created.

## Step 3: Configure Environment Variables
During the Blueprint setup (or after in the Dashboard), you MUST set these variables for the `aria-backend` service:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `REDIS_URL` | Your Upstash Redis URL (`rediss://...`) |
| `REDIS_ENABLED` | Set to `true` |

## Step 4: Important Note on Data (SQLite)
Since you are using SQLite (`aria.db`):
- **On Render's Free Tier**: Files are ephemeral. Every time the server restarts or you redeploy, your database (prayers, notes, sessions) will be wiped.
- **Solution**: If you need persistent data, you should either:
    1. Upgrade the Backend service to the **Starter** plan ($7/mo) and attach a **Disk** (I've included the commented-out code for this in `render.yaml`).
    2. Switch from SQLite to a managed database like **Render PostgreSQL** (which has a free tier).

## Step 5: Verify the URLs
- Once deployed, Render will provide a URL for your frontend (e.g., `https://aria-frontend.onrender.com`).
- The frontend is automatically configured to talk to the backend service via the `VITE_API_URL` variable.

---

### Troubleshooting
- **CORS Errors**: If you see CORS errors, ensure `CORS_ORIGINS` in the backend dashboard is set to `["*"]` or your specific frontend URL.
- **WebSocket Connection**: The voice call feature depends on `VITE_WS_URL`. Render handles `wss://` automatically.

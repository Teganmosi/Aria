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
| `DATABASE_URL` | Your PostgreSQL Connection URL (e.g., from Supabase) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_KEY` | Your Supabase public/anon Key |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `REDIS_URL` | Your Upstash Redis URL (`rediss://...`) |
| `REDIS_ENABLED` | Set to `true` (or `false` to disable caching) |
| `YARNGPT_API_KEY` | Your YarnGPT API Key (if using YarnGPT) |
| `NVIDIA_API_KEY` | Your NVIDIA API Key (if using NVIDIA models) |
| `API_BIBLE_KEY` | Your Bible API Key (if using API.Bible) |

## Step 4: Database Storage (PostgreSQL & Supabase Auth)
The application has been migrated from SQLite to **PostgreSQL**.
- All user auth is handled securely through **Supabase Auth**.
- All structured data (notes, profiles, devotions, prayers, study sessions) is persisted in your **PostgreSQL** database (typically hosted on Supabase).
- Data will remain persistent across restarts and redeploys without needing a Render Disk.

## Step 5: Verify the URLs
- Once deployed, Render will provide a URL for your frontend (e.g., `https://aria-frontend.onrender.com`).
- The frontend is automatically configured to talk to the backend service via the `VITE_API_URL` variable.

---

### Troubleshooting
- **CORS Errors**: If you see CORS errors, ensure `CORS_ORIGINS` in the backend dashboard is set to `["*"]` or your specific frontend URL.
- **WebSocket Connection**: The voice call feature depends on `VITE_WS_URL`. Render handles `wss://` automatically.

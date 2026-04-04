# Setup Guide for Faith AI Assistant

This guide will help you set up and run the Faith AI Assistant application.

## Prerequisites

Before you begin, make sure you have:

- Python 3.11 or higher installed
- pip (Python package manager)
- A Supabase account (free tier is fine)
- An OpenAI API key
- Basic knowledge of command line

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in the project details:
   - Name: `faith-ai-assistant`
   - Database Password: (create a strong password and save it)
   - Region: Choose a region close to you
6. Wait for the project to be created (2-3 minutes)

### 1.2 Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

### 1.3 Get Supabase Credentials

1. Go to "Project Settings" (gear icon in left sidebar)
2. Navigate to "API"
3. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (starts with `eyJhbGc`)
   - **service_role secret**: `eyJhbGc...` (starts with `eyJhbGc`)

⚠️ **Important**: Keep the `service_role secret` secure and never share it!

## Step 2: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Give it a name (e.g., "Faith AI Assistant")
6. Copy the key (starts with `sk-`)

⚠️ **Important**: Save this key securely. You won't be able to see it again!

## Step 3: Set Up the Project

### 3.1 Navigate to the Project Directory

```bash
cd faith-ai-assistant
```

### 3.2 Create a Virtual Environment (Recommended)

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Create Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor and fill in your credentials:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-openai-key-here

   # Application Configuration
   APP_NAME=Faith AI Assistant
   APP_VERSION=1.0.0
   DEBUG=True
   SECRET_KEY=generate-a-random-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # CORS Configuration
   CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
   ```

3. For `SECRET_KEY`, generate a random string. You can use Python:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

## Step 4: Run the Application

### 4.1 Start the Server

```bash
python main.py
```

You should see output like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 4.2 Access the Application

- **Frontend**: Open http://localhost:8000/app in your browser
- **API Documentation**: Open http://localhost:8000/docs for interactive API docs
- **Health Check**: http://localhost:8000/health

## Step 5: Test the Application

### 5.1 Create an Account

1. Open http://localhost:8000/app
2. You should see a login modal
3. Click "Sign Up" at the bottom
4. Fill in:
   - Email: your email
   - Password: create a password
   - Full Name: (optional)
5. Click "Sign Up"

### 5.2 Test Bible Study

1. Click on "Bible Study" in the navigation
2. Enter:
   - Book: `John`
   - Chapter: `3`
   - Verses: `16`
3. Click "Load Verse"
4. Click "Explain with AI" to get an AI explanation
5. Try "Real-time Chat" for a conversation

### 5.3 Test Emotional Support

1. Click on "Emotional Support" in the navigation
2. Select a mood (e.g., "😊 Happy")
3. Describe your situation
4. Click "Get Support"
5. Read the AI's comforting response

### 5.4 Test Devotion

1. Click on "Devotion" in the navigation
2. Set your preferred time and duration
3. Click "Save Settings"
4. Describe your day plans
5. Click "Start Devotion"
6. Read the prayer and scripture

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Make sure you've activated your virtual environment and installed dependencies:

```bash
# Activate venv (Windows)
venv\Scripts\activate

# Activate venv (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Issue: "Connection refused" or "Database error"

**Solution**: Check your Supabase credentials in `.env`:

- Make sure `SUPABASE_URL` is correct
- Verify `SUPABASE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are valid
- Ensure your Supabase project is active

### Issue: "OpenAI API error"

**Solution**: Check your OpenAI API key:

- Verify `OPENAI_API_KEY` is correct in `.env`
- Make sure you have credits in your OpenAI account
- Check if the API key has the necessary permissions

### Issue: "CORS error" in browser

**Solution**: Update `CORS_ORIGINS` in `.env`:

```env
CORS_ORIGINS=["http://localhost:8000", "http://localhost:3000"]
```

### Issue: WebSocket connection fails

**Solution**:

- Make sure the server is running
- Check that you're using `ws://` (not `wss://`) for local development
- Verify the session ID is correct

## Next Steps

### Development

1. **Explore the API**: Visit http://localhost:8000/docs to see all available endpoints
2. **Customize the Frontend**: Edit files in the `static/` directory
3. **Add Features**: Extend the backend by adding new endpoints in `main.py`
4. **Modify AI Prompts**: Update system prompts in `ai_service.py`

### Deployment

When you're ready to deploy:

1. **Database**: Already on Supabase
2. **Backend**: Deploy to a platform that supports Python/FastAPI:
   - [Railway](https://railway.app)
   - [Render](https://render.com)
   - [Vercel](https://vercel.com) (with Python support)
   - [AWS Lambda](https://aws.amazon.com/lambda)
3. **Frontend**: Deploy to:
   - [Vercel](https://vercel.com)
   - [Netlify](https://netlify.com)
   - [GitHub Pages](https://pages.github.com)

See the main [README.md](README.md) for more deployment information.

## Support

If you encounter any issues:

1. Check the terminal output for error messages
2. Review the [README.md](README.md) for detailed documentation
3. Check Supabase logs in your project dashboard
4. Verify all environment variables are set correctly

Happy coding! 🙏

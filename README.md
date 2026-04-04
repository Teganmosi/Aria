# Faith AI Assistant

A faith-based AI companion that provides Bible study assistance, emotional support, and daily devotion guidance.

## Features

- **Bible Study**: Select verses and get AI-powered explanations with historical and theological context
- **Emotional Support**: Share your feelings and receive comfort with relevant scriptures
- **Daily Devotion**: Start your day with personalized prayers and scripture readings
- **Real-time Chat**: Engage in conversations with AI for deeper understanding
- **User Authentication**: Secure login and registration using Supabase Auth

## Tech Stack

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **Supabase**: PostgreSQL database, authentication, and real-time features
- **OpenAI**: GPT-4 for AI-powered responses
- **Python 3.11+**: Core programming language

### Frontend

- **HTML/CSS/JavaScript**: Simple, responsive frontend
- **WebSocket**: Real-time communication for chat features

## Project Structure

```
faith-ai-assistant/
├── main.py                 # FastAPI application
├── config.py              # Application configuration
├── models.py              # Pydantic models
├── database.py            # Supabase database operations
├── ai_service.py          # OpenAI integration
├── auth.py               # Authentication utilities
├── requirements.txt       # Python dependencies
├── .env.example         # Environment variables template
├── static/              # Frontend files
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Styling
│   └── app.js          # Frontend JavaScript
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Database schema
```

## Setup Instructions

### 1. Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Supabase account
- OpenAI API key

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to the SQL Editor and run the migration script:
   ```bash
   cat supabase/migrations/001_initial_schema.sql
   ```
3. Copy your Supabase credentials:
   - Project URL
   - Anon Key
   - Service Role Key

### 3. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key

### 4. Set Up Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   SECRET_KEY=your_secret_key_for_jwt
   ```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the Application

```bash
python main.py
```

The application will be available at:

- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:8000/app

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `POST /api/v1/auth/logout` - Logout a user
- `GET /api/v1/auth/me` - Get current user profile

### Profile

- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile

### Bible Study

- `POST /api/v1/bible-study/sessions` - Create a Bible study session
- `GET /api/v1/bible-study/sessions` - Get all Bible study sessions
- `GET /api/v1/bible-study/sessions/{id}` - Get a specific session
- `POST /api/v1/bible-study/sessions/{id}/messages` - Create a message
- `GET /api/v1/bible-study/sessions/{id}/messages` - Get session messages

### Emotional Support

- `POST /api/v1/emotional-support/sessions` - Create an emotional support session
- `GET /api/v1/emotional-support/sessions` - Get all emotional support sessions
- `POST /api/v1/emotional-support/sessions/{id}/messages` - Create a message
- `GET /api/v1/emotional-support/sessions/{id}/messages` - Get session messages

### Devotion

- `GET /api/v1/devotion/settings` - Get devotion settings
- `PUT /api/v1/devotion/settings` - Update devotion settings
- `POST /api/v1/devotion/schedule` - Schedule a devotion
- `GET /api/v1/devotion/devotions` - Get all devotions
- `PUT /api/v1/devotion/devotions/{id}/complete` - Complete a devotion

### Bible

- `GET /api/v1/bible/search` - Search Bible verses
- `GET /api/v1/bible/verses/{book}/{chapter}/{verse}` - Get a specific verse
- `GET /api/v1/bible/scriptures/{category}` - Get scripture references by category

### AI

- `POST /api/v1/ai/generate` - Generate AI response

### WebSocket

- `WS /ws/bible-study/{session_id}` - Real-time Bible study chat
- `WS /ws/emotional-support/{session_id}` - Real-time emotional support chat

## Database Schema

The application uses PostgreSQL with the following main tables:

- `profiles` - User profiles
- `bible_study_sessions` - Bible study sessions
- `bible_study_messages` - Messages in Bible study sessions
- `emotional_support_sessions` - Emotional support sessions
- `emotional_support_messages` - Messages in emotional support sessions
- `devotion_settings` - Devotion settings
- `devotions` - Devotion records
- `devotion_messages` - Messages in devotion sessions
- `bible_verses` - Bible verses database
- `scripture_references` - Scripture references by category
- `user_favorites` - User favorites
- `journal_entries` - User journal entries

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Development

### Running in Development Mode

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
python main.py
```

### Testing the API

Visit http://localhost:8000/docs to access the interactive API documentation (Swagger UI).

## Deployment

### Deploy to Supabase

1. **Database**: Already hosted on Supabase
2. **Backend**: Deploy as Supabase Edge Functions or use a service like:
   - Railway
   - Render
   - Vercel (with Python support)
   - AWS Lambda
   - Google Cloud Functions

3. **Frontend**: Deploy to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Supabase Storage

### Environment Variables in Production

Make sure to set all environment variables in your deployment platform:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `SECRET_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.

## Acknowledgments

- Supabase for the excellent backend services
- OpenAI for the AI capabilities
- FastAPI for the amazing web framework

# Hunter System 🎯

A gamified personal development tracking system with workout logging, habit tracking, and progress visualization.

## Features

- **HUNTER PROTOCOL**: Track daily habits across 4 pillars (Grind, Vitality, Sense, Shadow)
- **Rank System**: Earn XP to progress through ranks (E → D → C → B → A → S → National)
- **Vitality Workouts**: 4-day fitness program with warmup, strength, flexibility, and breathing sections
- **Streak Tracking**: Maintain consecutive days of completed habits
- **Quest Log**: Journal entries for each completed day

## Tech Stack

**Frontend**:
- React 19 with Vite
- TanStack React Query
- Axios
- Modern CSS (no framework)

**Backend**:
- FastAPI (Python)
- SQLModel (SQLAlchemy ORM)
- SQLite (local) / PostgreSQL (production)
- Uvicorn

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Backend Setup
```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd backend
uvicorn main:app --reload
# API available at http://localhost:8000
```

## Project Structure
```
hunter-system/
├── frontend/              # React app (Vite)
│   ├── src/
│   │   ├── App.jsx       # Main app with Hunter Protocol
│   │   ├── Vitality.jsx  # Fitness tracking component
│   │   ├── api.js        # API client
│   │   └── ...
│   └── package.json
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── models/
│   │   ├── database.py   # SQLModel definitions
│   │   └── schemas.py
│   └── routers/
│       ├── logs.py       # Habit logging endpoints
│       ├── stats.py      # Stats retrieval
│       └── fitness.py    # Fitness tracking endpoints
└── requirements.txt      # Python dependencies
```

## API Endpoints

### Logs
- `GET /logs/` - Get all habit logs
- `GET /logs/today` - Get today's log
- `POST /logs/` - Create new log

### Stats
- `GET /stats/` - Get user statistics

### Fitness
- `GET /fitness/` - Get all fitness logs
- `GET /fitness/today` - Get today's fitness log
- `POST /fitness/` - Log a workout

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions to deploy on:
- **Frontend**: Netlify
- **Backend**: Railway

Quick summary:
1. Push to GitHub
2. Connect Netlify to `frontend/`
3. Connect Railway to backend with `Procfile`
4. Set environment variables for both

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000  # Change to Railway URL in production
```

### Backend (.env)
```
FRONTEND_URL=http://localhost:5173  # Change to Netlify URL in production
```

## Future Enhancements
- PostgreSQL database for production
- User authentication
- Mobile app (React Native)
- Social features (friend challenges, leaderboards)
- Data export/analytics dashboard

---

**Status**: 🚀 Ready for deployment

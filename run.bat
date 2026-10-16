@echo off
echo Starting RetailAI Backend and Frontend...

start cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
start cmd /k "cd frontend && npm run dev"

echo Both servers are launching!

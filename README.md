# EIS

This repository contains a Django backend and a React frontend for the EIS student marks application.

## Repository structure

- `backend/` - Django project, API, data import, and corrections
- `frontend/` - Vite + React app using TanStack Query for data fetching

## Backend setup

1. Create and activate a Python virtual environment:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in `backend/` with the required settings.
   For SQLite, use:

   ```env
   SECRET_KEY=your-secret-key
   DEBUG=True
   ALLOWED_HOSTS=127.0.0.1,localhost
   DB_ENGINE=django.db.backends.sqlite3
   DB_NAME=db.sqlite3
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

## Importing data

The import command reads the raw CSV at `backend/data/raw/students_marks.csv` and inserts students and marks.

```bash
cd backend
python manage.py import_students --reset
```

To import from a custom file:

```bash
python manage.py import_students --file data/raw/students_marks.csv
```

## Applying corrections

Corrections are stored in `backend/data/corrections/corrections.json`.

### Option 1: Run the correction script

```bash
cd backend
python scripts/apply_corrections.py
```

### Option 2: Use the API endpoint

Once the backend API is running, POST to:

```http
http://127.0.0.1:8000/api/marks/corrections/
```

Example JSON:

```json
{
  "admission_no": "EIS-1009",
  "subject": "English",
  "marks": 81
}
```

## Running the backend server

```bash
cd backend
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

## Frontend setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the React development server:

   ```bash
   npm run dev
   ```

3. Open the frontend in your browser using the local Vite URL.

## Available API endpoints

- `GET /api/students/` - list students, supports `?search=<text>`
- `GET /api/students/<admission_no>/` - student detail with marks
- `GET /api/summary/` - subject averages and top student
- `POST /api/marks/corrections/` - apply a correction

## GitHub repository setup

A local git repo has already been initialized in the root.

To publish it to GitHub:

1. Create a new repository on GitHub.
2. Add the remote and push:

   ```bash
   git remote add origin https://github.com/<your-org-or-user>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

If you want, I can also help you craft the GitHub repo name and remote configuration.

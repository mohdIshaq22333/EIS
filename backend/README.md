# EIS Backend

## Project setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Configure environment variables. The project uses `python-decouple` and expects values for:
   - `SECRET_KEY`
   - `DEBUG`
   - `ALLOWED_HOSTS`
   - `DB_ENGINE`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_HOST`
   - `DB_PORT`

Example `.env` for SQLite:

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

Example `.env` for PostgreSQL:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

---

## Database migrations

Run migrations after setup:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## Import raw CSV data

Import cleaned student and mark data from `data/raw/students_marks.csv`:

```bash
cd backend
python manage.py import_students --reset
```

You can also import from a specific file:

```bash
python manage.py import_students --file data/raw/students_marks.csv
```

---

## Apply corrections

Corrections are stored in `backend/data/corrections/corrections.json`.

### Option 1: Use the existing correction script

```bash
cd backend
python scripts/apply_corrections.py
```

### Option 2: Use the API after it is running

Send a POST to:

- `http://127.0.0.1:8000/api/marks/corrections/`

Example body:

```json
{
  "admission_no": "EIS-1009",
  "subject": "English",
  "marks": 81
}
```

---

## Run the API server

```bash
cd backend
python manage.py runserver
```

---

## Available API endpoints

- `GET /api/students/`
  - list students
  - supports `?search=<text>`

- `GET /api/students/<admission_no>/`
  - student detail
  - returns per-subject marks, total, and average

- `GET /api/summary/`
  - returns class average per subject
  - returns top student by total marks

- `POST /api/marks/corrections/`
  - request body:
    ```json
    {
      "admission_no": "EIS-1012",
      "subject": "Maths",
      "marks": 88
    }
    ```
  - validated fields:
    - admission number exists
    - subject is one of: `English`, `Hindi`, `Maths`, `Science`, `Social Science`
    - marks is an integer `0..100`
  - valid requests return `200`
  - invalid requests return `400`

---

## Testing the API

### Browser

Open these URLs:

- `http://127.0.0.1:8000/api/students/`
- `http://127.0.0.1:8000/api/students/EIS-1009/`
- `http://127.0.0.1:8000/api/summary/`
- `http://127.0.0.1:8000/api/marks/corrections/`

If DRF is configured correctly, you should see the browsable API interface.

### curl

```bash
curl http://127.0.0.1:8000/api/students/

curl http://127.0.0.1:8000/api/students/EIS-1009/

curl http://127.0.0.1:8000/api/summary/

curl -X POST http://127.0.0.1:8000/api/marks/corrections/ \
  -H "Content-Type: application/json" \
  -d '{"admission_no":"EIS-1009","subject":"English","marks":81}'
```

---

## Notes

- Totals and averages are computed dynamically from the database.
- Corrections update stored marks and are reflected immediately in API responses.
- Do not rerun import after applying corrections unless you intend to overwrite corrected values with raw CSV data.

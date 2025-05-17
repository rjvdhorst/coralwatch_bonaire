# CoralWatch Bonaire Backend Development Guide

## Environment Setup

1. Install Python 3.10 or higher
2. Install uv (recommended) or pip:
```bash
pip install uv
```

## Local Development Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd coralwatch_bonaire_mvp/backend
```

2. Create and activate a virtual environment:
```bash
# Using uv (recommended)
uv venv
source .venv/bin/activate  # On Unix/macOS
.venv\Scripts\activate     # On Windows

# Using standard venv
python -m venv .venv
source .venv/bin/activate  # On Unix/macOS
.venv\Scripts\activate     # On Windows
```

3. Install dependencies:
```bash
# Using uv (recommended)
uv pip install -r requirements.txt

# Using pip
pip install -r requirements.txt
```

## Project Structure

```
backend/
├── instance/            # Instance-specific files (SQLite DB, uploads)
│   ├── coralwatch.db   # SQLite database
│   └── uploads/        # Uploaded images
├── ml_models/          # Machine learning model files
├── app.py             # Main Flask application
├── database.py        # Database operations
├── requirements.txt   # Project dependencies
└── API.md            # API documentation
```

## Database

The application uses SQLite for data storage. The database file is automatically created at `instance/coralwatch.db` when the application starts.

### Database Schema

See `API.md` for detailed schema information.

### Database Operations

Common database operations are abstracted in `database.py`:
- `init_db()`: Initialize database tables
- `add_dive_site(name, lat, lon)`: Add new dive site
- `add_coral(internal_id, dive_site_id)`: Add new coral
- `add_coral_observation(...)`: Add new observation

## File Storage

Images are stored in the `instance/uploads` directory. The directory is automatically created when needed.

### File Naming

Uploaded files are automatically renamed using the format:
```
image_YYYYMMDD_HHMMSS_[8-char-random-uuid].extension
```

## Running the Application

1. Start the development server:
```bash
# With Flask CLI
flask run --debug

# Or with Python
python app.py
```

2. The API will be available at `http://localhost:5000`

## API Testing

Use curl to test the API endpoints (see API.md for detailed examples):

```bash
# Test server is running
curl http://localhost:5000/api/dive_sites

# Upload image
curl -X POST \
  -F "image=@test.jpg" \
  -F "dive_site_name=1000 Steps" \
  http://localhost:5000/api/upload
```

## Deployment

### Docker

1. Build the image:
```bash
docker build -t coralwatch-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 coralwatch-backend
```

### Manual Deployment

1. Set up Python environment as described in Setup
2. Configure your web server (e.g., nginx) to proxy requests to the Flask application
3. Use a production WSGI server (e.g., gunicorn):
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

## Contributing

1. Create a new branch for your feature
2. Write tests if applicable
3. Update documentation as needed
4. Submit a pull request

## Common Issues

### Database Locked

If you get a "database is locked" error:
1. Make sure you're not running multiple instances of the application
2. Check if any other process is accessing the database
3. If needed, delete the database file and restart the application

### Image Upload Issues

1. Check if the `instance/uploads` directory exists and is writable
2. Verify the file size isn't too large
3. Ensure the file extension is supported

## Future Improvements

1. Implement user authentication
2. Add coral matching using ML models
3. Add batch upload capability
4. Implement image compression
5. Add automated tests
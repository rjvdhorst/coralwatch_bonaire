# CoralWatch Bonaire MVP

A web application for monitoring and tracking individual coral colonies in Bonaire through photo documentation and manual tagging. This project consists of a React/TypeScript frontend and a Python Flask backend.

## Features

- Upload coral photos with dive site location
- Manual coral ID tagging for tracking individual colonies over time
- View timeline of coral observations
- Browse corals by dive site
- Docker support for easy deployment

## Project Structure

```
.
├── frontend/           # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── services/     # API client and utilities
│   └── package.json
├── backend/           # Python Flask API server
│   ├── app.py           # Main application file
│   ├── database.py      # Database operations
│   └── instance/        # SQLite DB and uploads (gitignored)
└── docker-compose.yml
```

## Development Setup

### Prerequisites

- Node.js v18 or higher
- Python 3.10 or higher
- Docker and Docker Compose (optional)

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

### Backend Setup

The backend uses uv for faster dependency management.

1. Install uv:
   ```bash
   pip install uv
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Create and activate virtual environment:
   ```bash
   uv venv
   source .venv/bin/activate  # On Unix/macOS
   # OR
   .venv\Scripts\activate     # On Windows
   ```

4. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```

5. Initialize database and uploads directory:
   ```bash
   mkdir -p instance
   flask init-db
   ```

6. Start the development server:
   ```bash
   flask run
   ```

The backend API will be available at http://localhost:5000

### Docker Setup

For easier deployment and development, you can use Docker:

1. Build and start the containers:
   ```bash
   docker compose up --build
   ```

This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000).

## API Documentation

### Endpoints

#### GET /api/dive_sites
Returns a list of all dive sites.

Response:
```json
[
  {
    "id": 1,
    "name": "Dive Site Name",
    "latitude": 12.1234,
    "longitude": -68.1234
  }
]
```

#### GET /api/corals_at_site/<dive_site_id>
Returns all corals at a specific dive site.

Response:
```json
[
  {
    "id": 1,
    "internal_id": "DS001_001",
    "last_updated_timestamp": "2024-01-01T12:00:00Z",
    "thumbnail": "image_filename.jpg"
  }
]
```

#### GET /api/coral_timeline/<coral_internal_id>
Returns the observation timeline for a specific coral.

Response:
```json
[
  {
    "image_filename": "image.jpg",
    "timestamp": "2024-01-01T12:00:00Z",
    "status": "healthy",
    "notes": "Optional notes"
  }
]
```

#### POST /api/upload
Upload a new coral image.

Request (multipart/form-data):
- image: File
- dive_site_name: string
- existing_coral_internal_id: string (optional)
- sctld_status_guess: string (optional)
- user_notes: string (optional)

Response:
```json
{
  "message": "Image added to existing coral",
  "coral_internal_id": "DS001_001",
  "filename": "uploaded_image.jpg",
  "dive_site": "Dive Site Name"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Why uv?

This project uses uv instead of pip for Python package management because:
- 10-100x faster than pip
- Better dependency resolution
- Built-in virtual environment management
- Compatible with existing Python packaging ecosystem

## Future Improvements

- Add user authentication and authorization
- Implement automated coral identification using machine learning
- Add support for multiple images per upload
- Add advanced search and filtering capabilities
- Implement data export functionality
- Add support for different coral health metrics
- Implement batch upload functionality
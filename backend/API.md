# CoralWatch Bonaire API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Upload Coral Image
Upload a new coral image and either create a new coral record or add to an existing one.

```
POST /upload
```

**Request Body** (multipart/form-data):
- `image`: File (required) - The coral image to upload
- `dive_site_name`: String (required) - Name of the dive site where the coral was observed
- `existing_coral_internal_id`: String (optional) - Internal ID of an existing coral if this image is of a previously documented coral

**Responses:**

For new coral:
```json
{
    "message": "New coral record created",
    "coral_internal_id": "STP_20240220_a1b2c3d4",
    "filename": "image_20240220_143022_a1b2c3d4.jpg",
    "dive_site": "Salt Pier"
}
```

For existing coral:
```json
{
    "message": "Image added to existing coral",
    "coral_internal_id": "STP_20240220_a1b2c3d4",
    "filename": "image_20240220_143022_e5f6g7h8.jpg",
    "dive_site": "Salt Pier"
}
```

**Error Responses:**
- 400 Bad Request: Missing image or dive site name
- 404 Not Found: Specified existing_coral_internal_id not found
- 500 Internal Server Error: Server-side error

### Get Dive Sites

Retrieve a list of all dive sites.

```
GET /dive_sites
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "1000 Steps",
        "latitude": 12.231,
        "longitude": -68.300
    },
    {
        "id": 2,
        "name": "Salt Pier",
        "latitude": 12.090,
        "longitude": -68.281
    }
]
```

### Get Corals at Site

Retrieve all corals observed at a specific dive site.

```
GET /corals_at_site/<dive_site_id>
```

**Parameters:**
- `dive_site_id`: Integer - The ID of the dive site

**Response:**
```json
[
    {
        "id": 1,
        "internal_id": "STP_20240220_a1b2c3d4",
        "last_updated_timestamp": "2024-02-20T14:30:22",
        "thumbnail": "image_20240220_143022_a1b2c3d4.jpg"
    }
]
```

### Get Coral Timeline

Retrieve the observation history for a specific coral.

```
GET /coral_timeline/<coral_internal_id>
```

**Parameters:**
- `coral_internal_id`: String - The internal ID of the coral

**Response:**
```json
[
    {
        "image_filename": "image_20240220_143022_a1b2c3d4.jpg",
        "timestamp": "2024-02-20T14:30:22",
        "status": "Healthy",
        "notes": "Initial observation"
    }
]
```

**Error Response:**
- 404 Not Found: Coral ID not found

### Get Image

Retrieve an uploaded coral image.

```
GET /images/<filename>
```

**Parameters:**
- `filename`: String - The filename of the image as returned by the upload endpoint

**Response:**
- Image file in its original format

**Error Response:**
- 404 Not Found: Image not found

## Database Schema

### DiveSites
```sql
CREATE TABLE DiveSites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    latitude REAL,
    longitude REAL
)
```

### Corals
```sql
CREATE TABLE Corals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internal_id TEXT UNIQUE NOT NULL,
    dive_site_id INTEGER,
    first_seen_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    representative_features TEXT,
    FOREIGN KEY (dive_site_id) REFERENCES DiveSites(id)
)
```

### CoralObservations
```sql
CREATE TABLE CoralObservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coral_id INTEGER,
    image_filename TEXT NOT NULL,
    observation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    reported_dive_site_id INTEGER,
    sctld_status_guess TEXT,
    user_notes TEXT,
    FOREIGN KEY (coral_id) REFERENCES Corals(id),
    FOREIGN KEY (reported_dive_site_id) REFERENCES DiveSites(id)
)
```

## File Storage

Images are stored in the `backend/instance/uploads` directory. Filenames are automatically generated using the format:
```
image_YYYYMMDD_HHMMSS_[unique-identifier].extension
```

## Error Handling

All endpoints may return the following error responses:
```json
{
    "error": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (missing or invalid parameters)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (server-side error)
import os
import sqlite3
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any


def get_db_path() -> str:
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    return os.path.join(instance_path, 'coralwatch.db')


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row  # Enable row factory for dict-like access
    return conn


def init_db() -> None:
    """Initialize database tables if they don't exist."""
    conn = get_db()
    try:
        cur = conn.cursor()
        
        # Create DiveSites table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS DiveSites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                latitude REAL,
                longitude REAL
            )
        ''')
        
        # Create Corals table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS Corals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                internal_id TEXT UNIQUE NOT NULL,
                dive_site_id INTEGER,
                first_seen_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                representative_features TEXT,
                FOREIGN KEY (dive_site_id) REFERENCES DiveSites(id)
            )
        ''')
        
        # Create CoralObservations table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS CoralObservations (
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
        ''')
        
        conn.commit()
    finally:
        conn.close()


def add_dive_site(name: str, lat: float = None, lon: float = None) -> int:
    """Add a new dive site if it doesn't exist, return its ID."""
    conn = get_db()
    try:
        cur = conn.cursor()
        # Try to find existing site
        cur.execute('SELECT id FROM DiveSites WHERE name = ?', (name,))
        result = cur.fetchone()
        if result:
            return result[0]
        
        # Create new site
        cur.execute(
            'INSERT INTO DiveSites (name, latitude, longitude) VALUES (?, ?, ?)',
            (name, lat, lon)
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def get_all_dive_sites() -> List[Dict[str, Any]]:
    """Return all dive sites."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('SELECT id, name, latitude, longitude FROM DiveSites')
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_dive_site_by_id(site_id: int) -> Optional[Dict[str, Any]]:
    """Get a dive site by its ID."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'SELECT id, name, latitude, longitude FROM DiveSites WHERE id = ?',
            (site_id,)
        )
        result = cur.fetchone()
        return dict(result) if result else None
    finally:
        conn.close()


def add_coral(internal_id: str, dive_site_id: int, representative_features_json: str = "{}") -> int:
    """Add a new coral, return its ID."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            '''INSERT INTO Corals 
               (internal_id, dive_site_id, representative_features) 
               VALUES (?, ?, ?)''',
            (internal_id, dive_site_id, representative_features_json)
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def find_coral_by_internal_id(internal_id: str) -> Optional[Dict[str, Any]]:
    """Find a coral by its internal ID."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'SELECT * FROM Corals WHERE internal_id = ?',
            (internal_id,)
        )
        result = cur.fetchone()
        return dict(result) if result else None
    finally:
        conn.close()


def add_coral_observation(
    coral_id: int,
    image_filename: str,
    reported_dive_site_id: int,
    sctld_status_guess: str = None,
    user_notes: str = None
) -> int:
    """Add a new coral observation."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            '''INSERT INTO CoralObservations 
               (coral_id, image_filename, reported_dive_site_id, sctld_status_guess, user_notes)
               VALUES (?, ?, ?, ?, ?)''',
            (coral_id, image_filename, reported_dive_site_id, sctld_status_guess, user_notes)
        )
        
        # Update coral's last_updated_timestamp
        cur.execute(
            '''UPDATE Corals 
               SET last_updated_timestamp = CURRENT_TIMESTAMP 
               WHERE id = ?''',
            (coral_id,)
        )
        
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def get_corals_by_dive_site(dive_site_id: int) -> List[Dict[str, Any]]:
    """Get all corals for a given dive site with their latest observation image."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('''
            SELECT 
                c.id,
                c.internal_id,
                c.last_updated_timestamp,
                (SELECT image_filename 
                 FROM CoralObservations 
                 WHERE coral_id = c.id 
                 ORDER BY observation_timestamp ASC 
                 LIMIT 1) as thumbnail
            FROM Corals c
            WHERE c.dive_site_id = ?
        ''', (dive_site_id,))
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_observations_for_coral(coral_id: int) -> List[Dict[str, Any]]:
    """Get all observations for a coral, ordered by timestamp."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('''
            SELECT 
                image_filename,
                observation_timestamp as timestamp,
                sctld_status_guess as status,
                user_notes as notes
            FROM CoralObservations
            WHERE coral_id = ?
            ORDER BY observation_timestamp DESC
        ''', (coral_id,))
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def generate_coral_internal_id(dive_site_name: str) -> str:
    """Generate a unique internal ID for a new coral."""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = uuid.uuid4().hex[:8]
    site_prefix = ''.join(word[0] for word in dive_site_name.split())[:3].upper()
    return f"{site_prefix}_{timestamp}_{random_suffix}"
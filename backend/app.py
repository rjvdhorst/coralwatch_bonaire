from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from pathlib import Path
import database as db
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure upload folder in instance directory
UPLOAD_FOLDER = Path(app.instance_path) / 'uploads'
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)

# Initialize database on startup
with app.app_context():
    db.init_db()

def generate_unique_filename(original_filename):
    """Generate a unique filename by adding timestamp."""
    base, ext = os.path.splitext(secure_filename(original_filename))
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{base}_{timestamp}{ext}"

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    dive_site_name = request.form.get('dive_site_name')
    existing_coral_internal_id = request.form.get('existing_coral_internal_id', '').strip()
    
    if not dive_site_name:
        return jsonify({'error': 'No dive site name provided'}), 400
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # 1. Save the uploaded image
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # 2. Get or create dive site
        dive_site_id = db.add_dive_site(dive_site_name)
        
        # 3. Handle coral record (existing or new)
        if existing_coral_internal_id:
            # Try to find existing coral
            existing_coral = db.find_coral_by_internal_id(existing_coral_internal_id)
            if not existing_coral:
                return jsonify({
                    'error': f'Coral with ID {existing_coral_internal_id} not found'
                }), 404
            
            # Add observation to existing coral
            db.add_coral_observation(
                coral_id=existing_coral['id'],
                image_filename=unique_filename,
                reported_dive_site_id=dive_site_id
            )
            
            return jsonify({
                'message': 'Image added to existing coral',
                'coral_internal_id': existing_coral_internal_id,
                'filename': unique_filename,
                'dive_site': dive_site_name
            })
        else:
            # Create new coral record
            coral_internal_id = db.generate_coral_internal_id(dive_site_name)
            coral_id = db.add_coral(coral_internal_id, dive_site_id)
            
            # Add initial observation
            db.add_coral_observation(
                coral_id=coral_id,
                image_filename=unique_filename,
                reported_dive_site_id=dive_site_id
            )
            
            return jsonify({
                'message': 'New coral record created',
                'coral_internal_id': coral_internal_id,
                'filename': unique_filename,
                'dive_site': dive_site_name
            })
            
    except Exception as e:
        app.logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/dive_sites', methods=['GET', 'POST'])
def dive_sites():
    if request.method == 'GET':
        try:
            sites = db.get_all_dive_sites()
            return jsonify(sites)
        except Exception as e:
            app.logger.error(f"Error retrieving dive sites: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
            
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data or 'name' not in data:
                return jsonify({'error': 'Dive site name is required'}), 400
                
            name = data['name']
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            
            # Validate coordinates if provided
            if latitude is not None and (not isinstance(latitude, (int, float)) or latitude < -90 or latitude > 90):
                return jsonify({'error': 'Latitude must be between -90 and 90 degrees'}), 400
                
            if longitude is not None and (not isinstance(longitude, (int, float)) or longitude < -180 or longitude > 180):
                return jsonify({'error': 'Longitude must be between -180 and 180 degrees'}), 400
            
            site_id = db.add_dive_site(name, latitude, longitude)
            site = db.get_dive_site_by_id(site_id)
            return jsonify(site), 201
            
        except sqlite3.IntegrityError:
            return jsonify({'error': 'A dive site with this name already exists'}), 409
        except Exception as e:
            app.logger.error(f"Error adding dive site: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/corals_at_site/<int:dive_site_id>', methods=['GET'])
def get_corals_at_site(dive_site_id):
    try:
        corals = db.get_corals_by_dive_site(dive_site_id)
        return jsonify(corals)
    except Exception as e:
        app.logger.error(f"Error retrieving corals: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/coral_timeline/<coral_internal_id>', methods=['GET'])
def get_coral_timeline(coral_internal_id):
    try:
        # First find the coral
        coral = db.find_coral_by_internal_id(coral_internal_id)
        if not coral:
            return jsonify({'error': 'Coral not found'}), 404
            
        # Get its observations
        observations = db.get_observations_for_coral(coral['id'])
        return jsonify(observations)
    except Exception as e:
        app.logger.error(f"Error retrieving coral timeline: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/images/<filename>')
def serve_image(filename):
    """Serve images from the upload folder."""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        app.logger.error(f"Error serving image: {str(e)}")
        return jsonify({'error': 'Image not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
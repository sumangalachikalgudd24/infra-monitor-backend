from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
import os
import jwt
import uuid
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='uploads')
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# In-memory storage (replace with a database in production)
reports = [
    {
        'id': str(uuid.uuid4()),
        'title': 'Cracked Wall in Building A',
        'description': 'Large crack noticed in the west wall of Building A, needs structural inspection.',
        'location': 'Building A, West Wing',
        'category': 'Structural',
        'image_path': None,
        'status': 'pending',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'reported_by': 'Admin User',
        'assigned_to': 'Civil Team',
        'priority': 'high',
        'notes': []
    },
    {
        'id': str(uuid.uuid4()),
        'title': 'Leaking Pipe in Restroom',
        'description': 'Continuous water leakage from pipe in first floor restroom.',
        'location': "First Floor, Men's Restroom",
        'category': 'Plumbing',
        'image_path': None,
        'status': 'in-progress',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'reported_by': 'Admin User',
        'assigned_to': 'John Plumber',
        'priority': 'high',
        'notes': []
    },
    {
        'id': str(uuid.uuid4()),
        'title': 'Flickering Lights in Corridor',
        'description': 'Lights flicker occasionally in the main corridor, possible wiring issue.',
        'location': 'Main Corridor, Second Floor',
        'category': 'Electrical',
        'image_path': None,
        'status': 'resolved',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'reported_by': 'Admin User',
        'assigned_to': 'Jane Electrician',
        'priority': 'medium',
        'notes': []
    },
]
users = [
    {
        'id': 1,
        'username': 'admin',
        'password': generate_password_hash('admin123'),
        'role': 'admin',
        'name': 'Admin User'
    },
    {
        'id': 2,
        'username': 'plumber1',
        'password': generate_password_hash('plumber123'),
        'role': 'worker',
        'name': 'John Plumber',
        'specialty': 'Plumbing'
    },
    {
        'id': 3,
        'username': 'electrician1',
        'password': generate_password_hash('electrician123'),
        'role': 'worker',
        'name': 'Jane Electrician',
        'specialty': 'Electrical'
    },
    {
        'id': 4,
        'username': 'carpenter1',
        'password': generate_password_hash('carpenter123'),
        'role': 'worker',
        'name': 'Carl Carpenter',
        'specialty': 'Furniture'
    },
    {
        'id': 5,
        'username': 'hvac1',
        'password': generate_password_hash('hvac123'),
        'role': 'worker',
        'name': 'Harry HVAC',
        'specialty': 'HVAC'
    },
    {
        'id': 6,
        'username': 'handyman1',
        'password': generate_password_hash('handyman123'),
        'role': 'worker',
        'name': 'Hank Handyman',
        'specialty': 'Other'
    }
]

# JWT Authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] if 'Bearer' in request.headers['Authorization'] else None
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = next((user for user in users if user['id'] == data['user_id']), None)
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    auth = request.get_json()
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify', 'success': False}), 401
    
    user = next((user for user in users if user['username'] == auth['username']), None)
    
    if not user or not check_password_hash(user['password'], auth['password']):
        return jsonify({'message': 'Invalid credentials', 'success': False}), 401
    
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    user_data = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            **user_data,
            'role': user_data['role'],
            'specialty': user_data.get('specialty')
        }
    })

@app.route('/api/reports', methods=['GET'])
@token_required
def get_reports(current_user):
    if current_user['role'] == 'admin':
        # Admins see all reports
        return jsonify({'success': True, 'reports': reports})
    else:
        # Workers see reports matching their specialty
        worker_specialty = current_user.get('specialty')
        if not worker_specialty:
            return jsonify({'success': False, 'message': 'Worker specialty not defined'}), 400
            
        # Get reports that match the worker's specialty and are either unassigned or assigned to them
        user_reports = [
            r for r in reports 
            if r.get('category') == worker_specialty and 
               (r.get('assigned_to') is None or r.get('assigned_to') == current_user.get('name'))
        ]
        return jsonify({'success': True, 'reports': user_reports})

@app.route('/api/reports/public', methods=['GET'])
def get_reports_public():
    """Public endpoint to view all reports, without auth/role filtering.
    Used by the frontend /reports page so all submitted reports are visible."""
    return jsonify({'success': True, 'reports': reports})

@app.route('/api/reports/<report_id>', methods=['GET'])
@token_required
def get_report(current_user, report_id):
    report = next((r for r in reports if r['id'] == report_id), None)
    
    if not report:
        return jsonify({'success': False, 'message': 'Report not found'}), 404
    
    # Check if user has permission to view this report
    if current_user['role'] != 'admin' and report.get('assigned_to') != current_user.get('name'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({'success': True, 'report': report})

@app.route('/api/reports', methods=['POST'])
@token_required
def create_report(current_user):
    try:
        print("Received request with files:", request.files)
        print("Received form data:", request.form)
        
        # Ensure the upload directory exists and is writable
        upload_dir = os.path.abspath(app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_dir, exist_ok=True)
        print(f"Upload directory: {upload_dir}")
        
        # Get form data
        data = request.form.to_dict()
        print("Form data:", data)
        
        # Handle file upload
        image_path = None
        if 'image' not in request.files:
            print("No image in request.files")
            # Continue without image if it's optional
        else:
            image_file = request.files['image']
            print(f"Received file: {image_file.filename}")
            
            # Check if file is selected
            if image_file.filename == '':
                print("No file selected")
                # Continue without image if no file selected
            elif image_file and allowed_file(image_file.filename):
                try:
                    # Generate a secure filename
                    original_filename = secure_filename(image_file.filename)
                    file_ext = original_filename.rsplit('.', 1)[1].lower()
                    unique_filename = f"{uuid.uuid4()}.{file_ext}"
                    
                    # Save the file
                    save_path = os.path.join(upload_dir, unique_filename)
                    print(f"Attempting to save to: {save_path}")
                    
                    # Ensure the directory exists again (double-check)
                    os.makedirs(os.path.dirname(save_path), exist_ok=True)
                    
                    # Save the file
                    image_file.save(save_path)
                    
                    # Verify file was saved
                    if os.path.exists(save_path):
                        image_path = f"/api/uploads/{unique_filename}"
                        print(f"File saved successfully: {save_path}")
                    else:
                        print("Error: File was not saved properly")
                        
                except Exception as e:
                    print(f"Error saving file: {str(e)}")
                    return jsonify({
                        'success': False,
                        'message': f'Error saving file: {str(e)}'
                    }), 500
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'success': False, 'message': 'Title is required'}), 400
            
        # Create report object
        report = {
            'id': str(uuid.uuid4()),
            'title': data.get('title', 'Untitled Report').strip(),
            'description': data.get('description', '').strip(),
            'location': data.get('location', 'Unknown').strip(),
            'category': data.get('category', 'Other'),
            'image_path': image_path,
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'reported_by': current_user.get('name', 'Anonymous'),
            'assigned_to': None,
            'priority': data.get('priority', 'medium'),
            'notes': []
        }
        
        # Auto-assign based on category (simplified example)
        if report['category'] == 'Structural':
            report['assigned_to'] = 'Civil Team'
        elif report['category'] == 'Electrical':
            report['assigned_to'] = 'Electrical Team'
        
        # Add to in-memory storage
        reports.append(report)
        
        # Prepare response
        response_data = {
            'success': True,
            'report': report,
            'message': 'Report created successfully!'
        }
        
        print(f"New report created: {report['id']}")
        return jsonify(response_data), 201
        
    except Exception as e:
        import traceback
        print(f"Error in create_report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': 'Failed to create report',
            'error': str(e),
            'trace': traceback.format_exc() if app.debug else None
        }), 500

@app.route('/api/reports/<report_id>', methods=['PUT'])
@token_required
def update_report(current_user, report_id):
    try:
        report = next((r for r in reports if r['id'] == report_id), None)
        
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404
            
        # Check permissions
        if current_user['role'] != 'admin' and report.get('assigned_to') != current_user.get('name'):
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update report fields
        for key in ['title', 'description', 'status', 'priority', 'assigned_to']:
            if key in data:
                report[key] = data[key]
        
        # Handle notes
        if 'note' in data and data['note'].strip():
            if 'notes' not in report:
                report['notes'] = []
                
            report['notes'].append({
                'id': str(uuid.uuid4()),
                'text': data['note'],
                'author': current_user['name'],
                'timestamp': datetime.utcnow().isoformat(),
                'isInternal': True
            })
        
        report['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'success': True,
            'report': report,
            'message': 'Report updated successfully!'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to update report',
            'error': str(e)
        }), 500

@app.route('/api/reports/<report_id>', methods=['DELETE'])
@token_required
def delete_report(current_user, report_id):
    if current_user['role'] != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    global reports
    initial_count = len(reports)
    reports = [r for r in reports if r['id'] != report_id]
    
    if len(reports) < initial_count:
        return jsonify({'success': True, 'message': 'Report deleted successfully'})
    else:
        return jsonify({'success': False, 'message': 'Report not found'}), 404

@app.route('/api/workers', methods=['GET'])
@token_required
def get_workers(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    worker_list = [{
        'id': user['id'],
        'name': user['name'],
        'username': user['username'],
        'team': user.get('team', 'Unassigned')
    } for user in users if user['role'] == 'worker']
    
    return jsonify({'success': True, 'workers': worker_list})

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    stats = {
        'total_reports': len(reports),
        'pending_reports': len([r for r in reports if r['status'] == 'pending']),
        'in_progress_reports': len([r for r in reports if r['status'] == 'in-progress']),
        'resolved_reports': len([r for r in reports if r['status'] == 'resolved']),
        'high_priority': len([r for r in reports if r.get('priority') == 'high']),
        'by_category': {}
    }
    
    # Count reports by category
    for report in reports:
        category = report.get('category', 'Other')
        stats['by_category'][category] = stats['by_category'].get(category, 0) + 1
    
    return jsonify({'success': True, 'stats': stats})

# Serve uploaded files
@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Helper functions
def allowed_file(filename):
    if not filename:
        print("No filename provided")
        return False
        
    print(f"Checking file: {filename}")
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    is_allowed = '.' in filename and extension in allowed_extensions
    print(f"File {filename} allowed: {is_allowed} (extension: {extension})")
    return is_allowed

@app.route('/api/tasks/<task_id>/status', methods=['PUT'])
@token_required
def update_task_status(current_user, task_id):
    if current_user['role'] not in ['admin', 'worker']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status or new_status not in ['pending', 'in-progress', 'completed']:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
    
    # Find the task
    task = next((t for t in reports if t['id'] == task_id), None)
    if not task:
        return jsonify({'success': False, 'message': 'Task not found'}), 404
    
    # If worker, check if they are assigned to this task or if it's unassigned
    if current_user['role'] == 'worker':
        # We store assigned_to as the worker's display name (e.g. "John Plumber")
        if task.get('assigned_to') and task['assigned_to'] != current_user.get('name'):
            return jsonify({'success': False, 'message': 'Not authorized to update this task'}), 403
    
    # Update the status
    task['status'] = new_status
    task['updated_at'] = datetime.utcnow().isoformat()
    
    # If completed, record who completed it and when
    if new_status == 'completed':
        task['completed_by'] = current_user.get('name', current_user.get('id'))
        task['completed_at'] = datetime.utcnow().isoformat()
    # If in-progress, assign to current worker if not already assigned
    elif new_status == 'in-progress' and not task.get('assigned_to'):
        # Store the worker's name for consistency with other endpoints
        task['assigned_to'] = current_user.get('name', current_user.get('id'))
        task['assigned_at'] = datetime.utcnow().isoformat()
    
    return jsonify({
        'success': True,
        'message': 'Task status updated',
        'task': task
    })

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)

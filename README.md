# Infrastructure Monitoring System

A comprehensive AI-driven infrastructure monitoring system for reporting and tracking infrastructure issues in real-time.

## Features

- **User Authentication**: Secure login for admin and workers
- **Report Management**: Create, view, update, and delete infrastructure issue reports
- **Role-based Access Control**: Different views and permissions for admins and workers
- **Image Upload**: Attach images to reports for better issue documentation
- **Real-time Updates**: Get instant updates on report status changes
- **Responsive Design**: Works on both desktop and mobile devices
- **Dashboard**: Overview of reports, statistics, and task assignments

## Tech Stack

### Backend
- Python 3.8+
- Flask
- JWT Authentication
- File upload handling

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios for API calls
- React Icons

## Prerequisites

- Python 3.8 or higher
- Node.js 14.x or higher
- npm or yarn

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create an uploads directory:
   ```bash
   mkdir uploads
   ```

4. Run the Flask development server:
   ```bash
   python app.py
   ```
   The backend server will start at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
   The frontend will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Reports
- `GET /api/reports` - Get all reports (filtered by user role)
- `GET /api/reports/:id` - Get a specific report
- `POST /api/reports` - Create a new report
- `PUT /api/reports/:id` - Update a report
- `DELETE /api/reports/:id` - Delete a report

### Workers
- `GET /api/workers` - Get all workers (admin only)

### Statistics
- `GET /api/stats` - Get system statistics (admin only)

## Default Users

### Admin
- Username: admin
- Password: admin123

### Worker
- Username: worker1
- Password: worker123

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

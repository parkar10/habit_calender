# Habit Tracker Calendar App

A beautiful and functional habit tracking application with a calendar interface, built with React frontend and Node.js backend with Cassandra database.

## Features

- 🔐 **Authentication**: Secure login with predefined credentials
- 📅 **Calendar Interface**: Interactive calendar to view and manage habits
- ✅ **Habit Management**: Add, view, and delete habits for any date
- 📊 **Trends & Analytics**: View your progress with statistics and charts
- 🎨 **Responsive Design**: Beautiful UI that works on all devices
- 💾 **Cassandra Database**: Scalable data storage for your habits

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Apache Cassandra (v4.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit_calender
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Cassandra**
   Make sure Apache Cassandra is running on your local machine:
   ```bash
   # On macOS with Homebrew
   brew services start cassandra
   
   # On Linux/Ubuntu
   sudo systemctl start cassandra
   
   # Or run directly
   cassandra -f
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:3001`

6. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will start on `http://localhost:3000`

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Usage

1. **Login**: Use the credentials above to sign in
2. **Calendar View**: Click on any date to add or view habits
3. **Add Habits**: In the popup modal, enter habit name and optional description
4. **View Trends**: Switch to the Trends tab to see your progress analytics
5. **Manage Habits**: Delete habits from the date popup if needed

## Project Structure

```
habit_calender/
├── backend/
│   ├── src/
│   │   └── server.ts          # Express server with Cassandra integration
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx      # Authentication component
│   │   │   ├── Calendar.tsx   # Calendar interface
│   │   │   ├── HabitModal.tsx # Habit entry popup
│   │   │   └── Trends.tsx     # Analytics dashboard
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── api.ts             # API calls
│   │   └── App.tsx            # Main application
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/habits/:date` - Get habits for a specific date
- `POST /api/habits` - Create a new habit
- `DELETE /api/habits/:habitId` - Delete a habit
- `GET /api/trends` - Get habit trends data

## Database Schema

The app creates a `habit_tracker` keyspace in Cassandra with the following table:

```sql
CREATE TABLE habits (
  habit_id UUID PRIMARY KEY,
  user_id TEXT,
  date TEXT,
  habit_name TEXT,
  description TEXT,
  completed BOOLEAN,
  created_at TIMESTAMP
);
```

## Technologies Used

### Frontend
- React 18 with TypeScript
- React Calendar for date selection
- Axios for API calls
- CSS3 with Flexbox and Grid
- Responsive design

### Backend
- Node.js with Express
- TypeScript
- Cassandra Driver
- JWT for authentication
- bcrypt for password hashing

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Starts development server with hot reload
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
npm start
```

## Customization

- **Credentials**: Modify the predefined credentials in `backend/src/server.ts`
- **Database**: Configure Cassandra connection settings in the server file
- **Styling**: Customize the CSS files in the components directory
- **Features**: Add new habit properties or analytics by extending the types and API

## Troubleshooting

1. **Database Connection Issues**
   - Ensure Cassandra is running and accessible
   - Check the connection settings in the server file
   - Verify the keyspace and table are created properly

2. **Port Conflicts**
   - Backend runs on port 3001, frontend on port 3000
   - Change ports in the respective configuration files if needed

3. **CORS Issues**
   - The backend is configured to allow all origins in development
   - Adjust CORS settings for production deployment

## Future Enhancements

- Multiple user support
- Habit categories and tags
- Goal setting and reminders
- Data export functionality
- Mobile app version
- Social features and sharing

Enjoy tracking your habits! 🎯
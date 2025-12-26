# Student Notes and Reminders Web App

A simple CRUD web application for students to manage notes and reminders with category filtering.

## Features

- ✅ Add, Edit, and Delete notes
- ✅ Mark reminders as completed
- ✅ Category filtering (School, Personal)
- ✅ Reminder notifications (browser notifications)
- ✅ JSON file-based storage
- ✅ Monotone black/white design

## Tech Stack

- **Backend**: Node.js, Express.js
- **Storage**: JSON file (data.json)
- **Frontend**: HTML, CSS, JavaScript
- **API**: Fetch API

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Usage

1. **Add a Note**: Click the "+ Add Note" button
2. **Edit a Note**: Click the "Edit" button on any note card
3. **Delete a Note**: Click the "Delete" button on any note card
4. **Mark as Completed**: Check the "Completed" checkbox on a note
5. **Filter by Category**: Use the dropdown to filter notes by category
6. **Set Reminders**: Add a reminder date and time when creating/editing a note

## Browser Notifications

The app will request permission to show browser notifications when reminders are due. Make sure to allow notifications in your browser settings.

## Data Storage

All notes are stored in `data.json` in the root directory. The file is automatically created when you first run the application.

## Deployment to Render.com

The app is configured to work on both localhost and Render.com.

### Deploying to Render:

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push your code to the repository

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the settings from `render.yaml`
   - Or manually configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Your app will be available at `https://your-app-name.onrender.com`

### Important Notes for Render:

- The app automatically uses the `PORT` environment variable provided by Render
- The frontend automatically detects the correct API URL based on the current host
- Data is stored in `data.json` on Render's filesystem (note: data may be lost if the service restarts or is redeployed)
- For persistent data storage, consider using a database service in production

### Local Development:

The app works the same way locally:
- Runs on `http://localhost:3000` by default
- Can be changed by setting the `PORT` environment variable


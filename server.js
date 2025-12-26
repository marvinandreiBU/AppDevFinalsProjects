const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ notes: [] }, null, 2));
  }
}

// Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { notes: [] };
  }
}

// Write data to JSON file
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// GET all notes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const note = data.notes.find(n => n.id === parseInt(req.params.id));
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST create new note
app.post('/api/notes', async (req, res) => {
  try {
    const data = await readData();
    const newNote = {
      id: data.notes.length > 0 ? Math.max(...data.notes.map(n => n.id)) + 1 : 1,
      title: req.body.title || '',
      content: req.body.content || '',
      category: req.body.category || 'Personal',
      reminder: req.body.reminder || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.notes.push(newNote);
    await writeData(data);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT update note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const noteIndex = data.notes.findIndex(n => n.id === parseInt(req.params.id));
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = data.notes[noteIndex];
    note.title = req.body.title !== undefined ? req.body.title : note.title;
    note.content = req.body.content !== undefined ? req.body.content : note.content;
    note.category = req.body.category !== undefined ? req.body.category : note.category;
    note.reminder = req.body.reminder !== undefined ? req.body.reminder : note.reminder;
    note.completed = req.body.completed !== undefined ? req.body.completed : note.completed;
    note.updatedAt = new Date().toISOString();
    
    await writeData(data);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const noteIndex = data.notes.findIndex(n => n.id === parseInt(req.params.id));
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    data.notes.splice(noteIndex, 1);
    await writeData(data);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Start server
async function startServer() {
  await initializeDataFile();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();


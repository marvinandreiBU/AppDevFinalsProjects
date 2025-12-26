// API Base URL - automatically detects current host
const API_BASE = `${window.location.origin}/api`;

// State
let notes = [];
let currentFilter = 'all';
let editingNoteId = null;

// DOM Elements
const notesContainer = document.getElementById('notesContainer');
const categoryFilter = document.getElementById('categoryFilter');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
    checkReminders();
    // Check reminders every minute
    setInterval(checkReminders, 60000);
});

// Event Listeners
function setupEventListeners() {
    addNoteBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalWindow());
    cancelBtn.addEventListener('click', () => closeModalWindow());
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) closeModalWindow();
    });
    categoryFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderNotes();
    });
    noteForm.addEventListener('submit', handleFormSubmit);
}

// API Functions
async function fetchNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        return await response.json();
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
}

async function createNote(noteData) {
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to create note');
        return await response.json();
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
}

async function updateNote(id, noteData) {
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to update note');
        return await response.json();
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

async function deleteNote(id) {
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete note');
        return await response.json();
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}

// Load and Render Notes
async function loadNotes() {
    notes = await fetchNotes();
    renderNotes();
}

function renderNotes() {
    const filteredNotes = currentFilter === 'all' 
        ? notes 
        : notes.filter(note => note.category === currentFilter);

    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No notes found</h3>
                <p>Click "Add Note" to create your first note</p>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = filteredNotes.map(note => createNoteCard(note)).join('');
    
    // Attach event listeners to note cards
    filteredNotes.forEach(note => {
        attachNoteEventListeners(note.id);
    });
}

function createNoteCard(note) {
    const reminderText = note.reminder 
        ? `Reminder: ${formatDateTime(note.reminder)}`
        : '';
    
    return `
        <div class="note-card ${note.completed ? 'completed' : ''}" data-id="${note.id}">
            <div class="completed-checkbox">
                <input type="checkbox" id="completed-${note.id}" ${note.completed ? 'checked' : ''}>
                <label for="completed-${note.id}">Completed</label>
            </div>
            <div class="note-category">${note.category}</div>
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            ${reminderText ? `<div class="note-reminder">${reminderText}</div>` : ''}
            <div class="note-actions">
                <button class="btn btn-primary edit-btn" data-id="${note.id}">Edit</button>
                <button class="btn btn-danger delete-btn" data-id="${note.id}">Delete</button>
            </div>
        </div>
    `;
}

function attachNoteEventListeners(noteId) {
    // Edit button
    const editBtn = document.querySelector(`.edit-btn[data-id="${noteId}"]`);
    if (editBtn) {
        editBtn.addEventListener('click', () => editNote(noteId));
    }

    // Delete button
    const deleteBtn = document.querySelector(`.delete-btn[data-id="${noteId}"]`);
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => confirmDelete(noteId));
    }

    // Completed checkbox
    const completedCheckbox = document.getElementById(`completed-${noteId}`);
    if (completedCheckbox) {
        completedCheckbox.addEventListener('change', (e) => toggleCompleted(noteId, e.target.checked));
    }
}

// Modal Functions
function openModal(noteId = null) {
    editingNoteId = noteId;
    if (noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            modalTitle.textContent = 'Edit Note';
            document.getElementById('noteId').value = note.id;
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('noteCategory').value = note.category;
            document.getElementById('noteReminder').value = note.reminder 
                ? new Date(note.reminder).toISOString().slice(0, 16)
                : '';
        }
    } else {
        modalTitle.textContent = 'Add Note';
        noteForm.reset();
        document.getElementById('noteId').value = '';
    }
    noteModal.style.display = 'block';
}

function closeModalWindow() {
    noteModal.style.display = 'none';
    noteForm.reset();
    editingNoteId = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const noteData = {
        title: document.getElementById('noteTitle').value.trim(),
        content: document.getElementById('noteContent').value.trim(),
        category: document.getElementById('noteCategory').value,
        reminder: document.getElementById('noteReminder').value 
            ? new Date(document.getElementById('noteReminder').value).toISOString()
            : null
    };

    try {
        if (editingNoteId) {
            await updateNote(editingNoteId, noteData);
        } else {
            await createNote(noteData);
        }
        closeModalWindow();
        loadNotes();
    } catch (error) {
        alert('Failed to save note. Please try again.');
    }
}

// Note Actions
async function editNote(noteId) {
    openModal(noteId);
}

async function confirmDelete(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            await deleteNote(noteId);
            loadNotes();
        } catch (error) {
            alert('Failed to delete note. Please try again.');
        }
    }
}

async function toggleCompleted(noteId, completed) {
    try {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            await updateNote(noteId, { completed });
            loadNotes();
        }
    } catch (error) {
        alert('Failed to update note. Please try again.');
    }
}

// Reminder Check
function checkReminders() {
    const now = new Date();
    notes.forEach(note => {
        if (note.reminder && !note.completed) {
            const reminderDate = new Date(note.reminder);
            if (reminderDate <= now && reminderDate > new Date(now.getTime() - 60000)) {
                showNotification(note);
            }
        }
    });
}

function showNotification(note) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Reminder: ${note.title}`, {
            body: note.content,
            icon: '/favicon.ico'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(`Reminder: ${note.title}`, {
                    body: note.content,
                    icon: '/favicon.ico'
                });
            }
        });
    }
}

// Request notification permission on load
if ('Notification' in window) {
    Notification.requestPermission();
}

// Utility Functions
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


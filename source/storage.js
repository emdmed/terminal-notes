import fs from 'fs';
import path from 'path';
import os from 'os';

const NOTES_FILE = '.terminal_notes.json';

export function getNotesFilePath() {
	const homeDir = os.homedir();
	return path.join(homeDir, NOTES_FILE);
}

export function loadNotes() {
	const filePath = getNotesFilePath();

	try {
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
			return [];
		}

		const fileContent = fs.readFileSync(filePath, 'utf8');
		const notes = JSON.parse(fileContent);

		if (!Array.isArray(notes)) {
			throw new Error('Invalid notes file format');
		}

		return notes;
	} catch (error) {
		console.error('Error loading notes:', error.message);
		return [];
	}
}

export function saveNotes(notes) {
	const filePath = getNotesFilePath();

	try {
		if (!Array.isArray(notes)) {
			throw new Error('Notes must be an array');
		}

		fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
		return true;
	} catch (error) {
		console.error('Error saving notes:', error.message);
		return false;
	}
}

export function addNote(title, content, priority = 'none') {
	const notes = loadNotes();

	const newNote = {
		id: Date.now().toString(),
		title: title.trim(),
		content: content.trim(),
		priority: priority,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	notes.push(newNote);
	saveNotes(notes);

	return newNote;
}

export function deleteNote(id) {
	const notes = loadNotes();
	const filteredNotes = notes.filter(note => note.id !== id);

	if (filteredNotes.length === notes.length) {
		return false;
	}

	saveNotes(filteredNotes);
	return true;
}

export function getNoteById(id) {
	const notes = loadNotes();
	return notes.find(note => note.id === id);
}

export function updateNote(id, title, content, priority = null) {
	const notes = loadNotes();
	const noteIndex = notes.findIndex(note => note.id === id);

	if (noteIndex === -1) {
		return false;
	}

	notes[noteIndex] = {
		...notes[noteIndex],
		title: title.trim(),
		content: content.trim(),
		updatedAt: new Date().toISOString(),
	};

	if (priority !== null) {
		notes[noteIndex].priority = priority;
	}

	saveNotes(notes);
	return notes[noteIndex];
}

import fs from 'fs';
import path from 'path';
import os from 'os';

const NOTES_FILE = '.terminal_notes.json';

export function getNotesFilePath() {
	const homeDir = os.homedir();
	return path.join(homeDir, NOTES_FILE);
}

// Default themes to populate on first load
const defaultThemes = {
	default: {
		primary: "#6ee7b7",
		secondary: "#c4b5fd",
		danger: "#fb7185",
		warning: "#fcd34d",
		success: "#bef264",
		info: "#93c5fd",
		priorityNone: "#ffffff",
		priorityLow: "#93c5fd",
		priorityMedium: "#fef08a",
		priorityHigh: "#f87171"
	},
	dark: {
		primary: "#10b981",
		secondary: "#8b5cf6",
		danger: "#ef4444",
		warning: "#f59e0b",
		success: "#84cc16",
		info: "#3b82f6",
		priorityNone: "#d1d5db",
		priorityLow: "#60a5fa",
		priorityMedium: "#fbbf24",
		priorityHigh: "#f87171"
	},
	nord: {
		primary: "#88c0d0",
		secondary: "#b48ead",
		danger: "#bf616a",
		warning: "#ebcb8b",
		success: "#a3be8c",
		info: "#81a1c1",
		priorityNone: "#4c566a",
		priorityLow: "#5e81ac",
		priorityMedium: "#ebcb8b",
		priorityHigh: "#bf616a"
	},
	gruvbox: {
		primary: "#83a598",
		secondary: "#d3869b",
		danger: "#fb4934",
		warning: "#fabd2f",
		success: "#b8bb26",
		info: "#8ec07c",
		priorityNone: "#a89984",
		priorityLow: "#83a598",
		priorityMedium: "#fabd2f",
		priorityHigh: "#fb4934"
	},
	dracula: {
		primary: "#50fa7b",
		secondary: "#bd93f9",
		danger: "#ff5555",
		warning: "#f1fa8c",
		success: "#50fa7b",
		info: "#8be9fd",
		priorityNone: "#f8f8f2",
		priorityLow: "#8be9fd",
		priorityMedium: "#f1fa8c",
		priorityHigh: "#ff5555"
	}
};

function loadData() {
	const filePath = getNotesFilePath();

	try {
		if (!fs.existsSync(filePath)) {
			const defaultData = {
				config: { theme: 'default' },
				themes: defaultThemes,
				notes: []
			};
			fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
			return defaultData;
		}

		const fileContent = fs.readFileSync(filePath, 'utf8');
		const data = JSON.parse(fileContent);

		// Backwards compatibility: if data is array, migrate to new format
		if (Array.isArray(data)) {
			const migratedData = {
				config: { theme: 'default' },
				themes: defaultThemes,
				notes: data
			};
			fs.writeFileSync(filePath, JSON.stringify(migratedData, null, 2), 'utf8');
			return migratedData;
		}

		// Ensure config exists
		if (!data.config) {
			data.config = { theme: 'default' };
		}

		// Ensure themes exists (migration for existing users)
		if (!data.themes) {
			data.themes = defaultThemes;
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
		}

		// Ensure notes exists
		if (!Array.isArray(data.notes)) {
			data.notes = [];
		}

		// Migration: ensure all notes have links array and obscured property
		let needsMigration = false;
		data.notes = data.notes.map(note => {
			const updatedNote = { ...note };

			if (!Array.isArray(note.links)) {
				needsMigration = true;
				updatedNote.links = [];
			}

			if (note.obscured === undefined) {
				needsMigration = true;
				updatedNote.obscured = false;
			}

			return updatedNote;
		});

		if (needsMigration) {
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
		}

		return data;
	} catch (error) {
		console.error('Error loading data:', error.message);
		return {
			config: { theme: 'default' },
			themes: defaultThemes,
			notes: []
		};
	}
}

export function loadNotes() {
	const data = loadData();
	return data.notes;
}

function saveData(data) {
	const filePath = getNotesFilePath();

	try {
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
		return true;
	} catch (error) {
		console.error('Error saving data:', error.message);
		return false;
	}
}

export function saveNotes(notes) {
	try {
		if (!Array.isArray(notes)) {
			throw new Error('Notes must be an array');
		}

		const data = loadData();
		data.notes = notes;
		return saveData(data);
	} catch (error) {
		console.error('Error saving notes:', error.message);
		return false;
	}
}

export function addNote(title, content, priority = 'none', links = [], obscured = false) {
	const notes = loadNotes();

	const newNote = {
		id: Date.now().toString(),
		title: title.trim(),
		content: content.trim(),
		priority: priority,
		links: links || [],
		obscured: obscured,
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

export function updateNote(id, title, content, priority = null, links = null, obscured = null) {
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

	if (links !== null) {
		notes[noteIndex].links = links;
	}

	if (obscured !== null) {
		notes[noteIndex].obscured = obscured;
	}

	saveNotes(notes);
	return notes[noteIndex];
}

export function loadConfig() {
	const data = loadData();
	return data.config;
}

export function saveConfig(config) {
	try {
		const data = loadData();
		data.config = { ...data.config, ...config };
		return saveData(data);
	} catch (error) {
		console.error('Error saving config:', error.message);
		return false;
	}
}

export function loadThemes() {
	const data = loadData();
	return data.themes || defaultThemes;
}

export function saveThemes(themes) {
	try {
		if (typeof themes !== 'object' || themes === null) {
			throw new Error('Themes must be an object');
		}

		const data = loadData();
		data.themes = themes;
		return saveData(data);
	} catch (error) {
		console.error('Error saving themes:', error.message);
		return false;
	}
}

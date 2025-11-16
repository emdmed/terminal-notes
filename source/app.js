import React, { useState, useEffect } from 'react';
import { useInput, useApp } from 'ink';
import { ThemeProvider } from './contexts/ThemeContext.js';
import NoteListView from './components/NoteListView.js';
import NoteEditor from './components/NoteEditor.js';
import DeleteConfirmation from './components/DeleteConfirmation.js';
import {
	loadNotes,
	addNote,
	updateNote,
	deleteNote,
	getNoteById,
} from './storage.js';

function AppContent() {
	const { exit } = useApp();
	const [view, setView] = useState('list');
	const [notes, setNotes] = useState([]);
	const [selectedNoteId, setSelectedNoteId] = useState(null);
	const [editorMode, setEditorMode] = useState('edit');
	const [sortMode, setSortMode] = useState('priority-asc');

	useEffect(() => {
		const loadedNotes = loadNotes();
		setNotes(loadedNotes);
	}, []);

	useInput((input, key) => {
		if ((input === 'q' || key.escape) && view === 'list') {
			exit();
		}
	});

	const refreshNotes = () => {
		const updatedNotes = loadNotes();
		setNotes(updatedNotes);
	};

	const handleAdd = () => {
		setSelectedNoteId(null);
		setEditorMode('edit');
		setView('edit');
	};

	const handleView = noteId => {
		setSelectedNoteId(noteId);
		setEditorMode('view');
		setView('edit');
	};

	const handleEdit = noteId => {
		setSelectedNoteId(noteId);
		setEditorMode('edit');
		setView('edit');
	};

	const handleSaveNote = (title, content, priority, links, obscured) => {
		if (selectedNoteId) {
			updateNote(selectedNoteId, title, content, priority, links, obscured);
		} else {
			addNote(title, content, priority, links, obscured);
		}
		refreshNotes();
		setSelectedNoteId(null);
		setView('list');
	};

	const handleDeleteRequest = noteId => {
		setSelectedNoteId(noteId);
		setView('delete');
	};

	const handleDeleteConfirm = () => {
		if (selectedNoteId) {
			deleteNote(selectedNoteId);
			refreshNotes();
			setSelectedNoteId(null);
		}
		setView('list');
	};

	const handleCancel = () => {
		setSelectedNoteId(null);
		setView('list');
	};

	const handleToggleSort = () => {
		const sortCycle = ['priority-asc', 'priority-desc', 'date-asc', 'date-desc'];
		const currentIndex = sortCycle.indexOf(sortMode);
		const nextIndex = (currentIndex + 1) % sortCycle.length;
		setSortMode(sortCycle[nextIndex]);
	};

	const handleChangePriority = (noteId, priority) => {
		const note = getNoteById(noteId);
		if (note) {
			updateNote(noteId, note.title, note.content, priority, note.links, note.obscured);
			refreshNotes();
		}
	};

	const handleToggleObscured = (noteId) => {
		const note = getNoteById(noteId);
		if (note) {
			const newObscuredState = !note.obscured;
			updateNote(noteId, note.title, note.content, note.priority, note.links, newObscuredState);
			refreshNotes();
		}
	};

	const sortNotes = (notesToSort) => {
		const sorted = [...notesToSort];
		const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };

		switch (sortMode) {
			case 'priority-asc':
				return sorted.sort((a, b) => {
					const priorityA = priorityOrder[a.priority || 'none'];
					const priorityB = priorityOrder[b.priority || 'none'];
					return priorityA - priorityB;
				});
			case 'priority-desc':
				return sorted.sort((a, b) => {
					const priorityA = priorityOrder[a.priority || 'none'];
					const priorityB = priorityOrder[b.priority || 'none'];
					return priorityB - priorityA;
				});
			case 'date-asc':
				return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
			case 'date-desc':
				return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			default:
				return sorted;
		}
	};

	if (view === 'list') {
		return (
			<NoteListView
				notes={sortNotes(notes)}
				onView={handleView}
				onEdit={handleEdit}
				onDelete={handleDeleteRequest}
				onAdd={handleAdd}
				sortMode={sortMode}
				onToggleSort={handleToggleSort}
				onChangePriority={handleChangePriority}
				onToggleObscured={handleToggleObscured}
			/>
		);
	}

	if (view === 'edit') {
		const note = selectedNoteId ? getNoteById(selectedNoteId) : null;
		return <NoteEditor note={note} onSave={handleSaveNote} onCancel={handleCancel} mode={editorMode} />;
	}

	if (view === 'delete') {
		const note = getNoteById(selectedNoteId);
		return (
			<DeleteConfirmation
				note={note}
				onConfirm={handleDeleteConfirm}
				onCancel={handleCancel}
			/>
		);
	}

	return null;
}

export default function App() {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
}

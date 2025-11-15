import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useScreenSize } from '../hooks/useScreenSize.js';
import { colors } from '../utils/colors.js';

const NoteDetailView = ({ note, onSave, onBack, onDelete }) => {
	const { height, width } = useScreenSize();
	const [isEditing, setIsEditing] = useState(false);
	const [editingField, setEditingField] = useState('title');
	const [title, setTitle] = useState(note.title);
	const [content, setContent] = useState(note.content);
	const [priority, setPriority] = useState(note.priority || 'none');

	const priorities = ['high', 'medium', 'low', 'none'];

	useEffect(() => {
		setTitle(note.title);
		setContent(note.content);
		setPriority(note.priority || 'none');
	}, [note]);

	useInput((input, key) => {
		if (!isEditing) {
			if (key.escape || input === 'q') {
				onBack();
			}
			else if (input === 'i' || input === 'e') {
				setIsEditing(true);
				setEditingField('title');
			}
			else if (input === 'd') {
				onDelete(note.id);
			}
		} else {
			if (key.escape) {
				setTitle(note.title);
				setContent(note.content);
				setPriority(note.priority || 'none');
				setIsEditing(false);
			}
			else if (key.downArrow) {
				if (editingField === 'title') {
					setEditingField('priority');
				} else if (editingField === 'priority') {
					setEditingField('content');
				}
			}
			else if (key.upArrow) {
				if (editingField === 'content') {
					setEditingField('priority');
				} else if (editingField === 'priority') {
					setEditingField('title');
				}
			}
			else if (editingField === 'priority') {
				if (key.leftArrow || input === 'h') {
					const currentIndex = priorities.indexOf(priority);
					const newIndex = currentIndex > 0 ? currentIndex - 1 : priorities.length - 1;
					setPriority(priorities[newIndex]);
				} else if (key.rightArrow || input === 'l') {
					const currentIndex = priorities.indexOf(priority);
					const newIndex = currentIndex < priorities.length - 1 ? currentIndex + 1 : 0;
					setPriority(priorities[newIndex]);
				}
			}
			else if (input === 's' && key.ctrl) {
				onSave(note.id, title, content, priority);
				setIsEditing(false);
			}
		}
	});

	const handleTitleChange = value => {
		setTitle(value);
	};

	const handleTitleSubmit = () => {
		setEditingField('priority');
	};

	const handleContentChange = value => {
		setContent(value);
	};

	const handleContentSubmit = () => {
		onSave(note.id, title, content, priority);
		setIsEditing(false);
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	return (
		<Box
			flexDirection="column"
			width={width}
			height={height}
			paddingX={2}
			paddingY={1}
		>
			<Box marginBottom={1} flexDirection="row" alignItems="center">
				{isEditing && editingField === 'title' ? (
					<Box flexGrow={1}>
						<TextInput
							value={title}
							onChange={handleTitleChange}
							onSubmit={handleTitleSubmit}
						/>
					</Box>
				) : (
					<>
						<Text inverse bold color={colors.green}>
							{" "}{title}{" "}
						</Text>
						{isEditing && editingField !== 'title' && (
							<Text color={colors.green}> (↑ to edit)</Text>
						)}
					</>
				)}
				<Text color={colors.green}> | Priority: </Text>
				{isEditing && editingField === 'priority' ? (
					<>
						<Text inverse color={colors.green}> {priority.toUpperCase()} </Text>
						<Text color={colors.green}> (←/→ or h/l)</Text>
					</>
				) : (
					<>
						<Text color={colors.green}>{priority}</Text>
						{isEditing && editingField === 'content' && <Text color={colors.green}> (↑ to edit)</Text>}
					</>
				)}
			</Box>

			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={colors.green}
				paddingX={1}
				paddingY={1}
			>
				{isEditing && editingField === 'content' ? (
					<Box flexDirection="column">
						<TextInput
							value={content}
							onChange={handleContentChange}
							onSubmit={handleContentSubmit}
						/>
					</Box>
				) : (
					<Box flexDirection="column">
						<Text color={colors.green}>{content}</Text>
						{isEditing && editingField !== 'content' && (
							<Text color={colors.green} marginTop={1}>
								(↓ to edit)
							</Text>
						)}
					</Box>
				)}
			</Box>

			<Box marginTop={1}>
				<Text dimColor>
					Created: {formatDate(note.createdAt)} | Updated:{' '}
					{formatDate(note.updatedAt)}
				</Text>
			</Box>

			<Box paddingX={1} marginTop={1}>
				{!isEditing ? (
					<Text dimColor>e/i=edit | d=delete | q/ESC=back</Text>
				) : (
					<Text dimColor>
						↑/↓=switch field | ←/→ or h/l=change priority | Enter=next/save | Ctrl+S=save | ESC=cancel
					</Text>
				)}
			</Box>
		</Box>
	);
};

export default NoteDetailView;

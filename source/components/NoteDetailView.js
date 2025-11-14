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

	useEffect(() => {
		setTitle(note.title);
		setContent(note.content);
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
				setIsEditing(false);
			}
			else if (key.downArrow) {
				if (editingField === 'title') {
					setEditingField('content');
				}
			}
			else if (key.upArrow) {
				if (editingField === 'content') {
					setEditingField('title');
				}
			}
			else if (input === 's' && key.ctrl) {
				onSave(note.id, title, content);
				setIsEditing(false);
			}
		}
	});

	const handleTitleChange = value => {
		setTitle(value);
	};

	const handleTitleSubmit = () => {
		setEditingField('content');
	};

	const handleContentChange = value => {
		setContent(value);
	};

	const handleContentSubmit = () => {
		onSave(note.id, title, content);
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
			<Box marginBottom={1} flexDirection="column">
				{isEditing && editingField === 'title' ? (
					<Box>
						<TextInput
							value={title}
							onChange={handleTitleChange}
							onSubmit={handleTitleSubmit}
						/>
					</Box>
				) : (
					<Box>
						<Text inverse bold color={colors.green}>
							{" "}{title}{" "}
						</Text>
						{isEditing && editingField !== 'title' && (
							<Text color={colors.green}> (↑ to edit)</Text>
						)}
					</Box>
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
						↑/↓=switch field | Enter=next/save | Ctrl+S=save | ESC=cancel
					</Text>
				)}
			</Box>
		</Box>
	);
};

export default NoteDetailView;

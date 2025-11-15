import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {useScreenSize} from '../hooks/useScreenSize.js';
import {colors} from '../utils/colors.js';

const NoteEditor = ({note, onSave, onCancel}) => {
	const [editingField, setEditingField] = useState('title');
	const [title, setTitle] = useState(note ? note.title : '');
	const [content, setContent] = useState(note ? note.content : '');
	const [priority, setPriority] = useState(note ? note.priority || 'none' : 'none');
	const {height, width} = useScreenSize();

	const priorities = ['high', 'medium', 'low', 'none'];

	useInput((input, key) => {
		if (key.escape) {
			onCancel();
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
			if (title.trim() && content.trim()) {
				onSave(title, content, priority);
			}
		}
	});

	const handleTitleSubmit = () => {
		setEditingField('priority');
	};

	const handleContentSubmit = () => {
		if (title.trim() && content.trim()) {
			onSave(title, content, priority);
		}
	};

	const handleTitleChange = value => {
		setTitle(value);
	};

	const handleContentChange = value => {
		setContent(value);
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
				{editingField === 'title' ? (
					<Box flexGrow={1}>
						<TextInput
							value={title}
							onChange={handleTitleChange}
							onSubmit={handleTitleSubmit}
							placeholder="Enter note title..."
						/>
					</Box>
				) : (
					<>
						<Text inverse color={colors.green}>
							{" "}{title || 'Untitled'}{" "}
						</Text>
						<Text color={colors.green}> (↑ to edit)</Text>
					</>
				)}
				<Text color={colors.green}> | Priority: </Text>
				{editingField === 'priority' ? (
					<>
						<Text inverse color={colors.green}> {priority.toUpperCase()} </Text>
						<Text color={colors.green}> (←/→ or h/l)</Text>
					</>
				) : (
					<>
						<Text color={colors.green}>{priority}</Text>
						{editingField === 'content' && <Text color={colors.green}> (↑ to edit)</Text>}
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
				{editingField === 'content' ? (
					<Box flexDirection="column">
						<TextInput
							value={content}
							onChange={handleContentChange}
							onSubmit={handleContentSubmit}
							placeholder="Enter note content..."
						/>
					</Box>
				) : (
					<Box flexDirection="column">
						<Text color={colors.green}>{content || '(empty)'}</Text>
						<Text color={colors.green} marginTop={1}>
							(↓ to edit)
						</Text>
					</Box>
				)}
			</Box>

			<Box paddingX={1} marginTop={1}>
				<Text dimColor>
					↑/↓=switch field | ←/→ or h/l=change priority | Enter=next/save | Ctrl+S=save | ESC=cancel
				</Text>
			</Box>
		</Box>
	);
};

export default NoteEditor;

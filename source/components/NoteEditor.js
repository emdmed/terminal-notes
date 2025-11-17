import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import MultilineInput from './MultilineInput.js';
import { useScreenSize } from '../hooks/useScreenSize.js';
import { useTheme } from '../contexts/ThemeContext.js';
import { exec } from 'child_process';

// URL validation function
const isValidUrl = (string) => {
	try {
		const url = new URL(string);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch (_) {
		return false;
	}
};

const NoteEditor = ({ note, onSave, onCancel, mode = 'edit' }) => {
	const [isViewMode, setIsViewMode] = useState(mode === 'view');
	const [editingField, setEditingField] = useState('title');
	const [title, setTitle] = useState(note ? note.title : '');
	const [content, setContent] = useState(note ? note.content : '');
	const [priority, setPriority] = useState(note ? note.priority || 'none' : 'none');
	const [links, setLinks] = useState(note ? (note.links || []) : []);
	const [obscured, setObscured] = useState(note ? note.obscured || false : false);
	const [addingLink, setAddingLink] = useState(false);
	const [newLinkUrl, setNewLinkUrl] = useState('');
	const [newLinkTitle, setNewLinkTitle] = useState('');
	const [linkInputField, setLinkInputField] = useState('url');
	const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);
	const { height, width } = useScreenSize();
	const { colors } = useTheme();

	const priorities = ['high', 'medium', 'low', 'none'];

	// Open link in browser
	const openLink = (url) => {
		const command = process.platform === 'darwin' ? 'open' :
			process.platform === 'win32' ? 'start' : 'xdg-open';
		exec(`${command} "${url}"`);
	};

	useInput((input, key) => {
		if (key.escape) {
			if (addingLink) {
				setAddingLink(false);
				setNewLinkUrl('');
				setNewLinkTitle('');
				setLinkInputField('url');
				return;
			}
			onCancel();
			return;
		}

		// View mode - navigate and open links
		if (isViewMode) {
			if (key.return) {
				setIsViewMode(false);
				return;
			}
			if (input === 'x') {
				const newObscuredState = !obscured;
				setObscured(newObscuredState);
				onSave(title, content, priority, links, newObscuredState);
				return;
			}
			if (input === 'o' && links.length > 0) {
				openLink(links[selectedLinkIndex].url);
				return;
			}
			if ((input === 'd' || key.delete) && links.length > 0) {
				handleDeleteLink(selectedLinkIndex);
				return;
			}
			if (key.upArrow && links.length > 0) {
				setSelectedLinkIndex(Math.max(0, selectedLinkIndex - 1));
				return;
			}
			if (key.downArrow && links.length > 0) {
				setSelectedLinkIndex(Math.min(links.length - 1, selectedLinkIndex + 1));
				return;
			}
			return;
		}

		// Adding link mode
		if (addingLink) {
			return; // Let TextInput handle it
		}

		if (key.downArrow) {
			if (editingField === 'title') {
				setEditingField('content');
			}
			return;
		}

		if (key.upArrow) {
			if (editingField === 'content') {
				setEditingField('title');
			}
			return;
		}

		if (key.tab) {
			const currentIndex = priorities.indexOf(priority);
			const newIndex = (currentIndex + 1) % priorities.length;
			setPriority(priorities[newIndex]);
			return;
		}

		if (input === 'x') {
			setObscured(!obscured);
			return;
		}

		if (input === 'l' && key.ctrl) {
			setAddingLink(true);
			return;
		}

		if (input === 's' && key.ctrl) {
			if (title.trim() && content.trim()) {
				onSave(title, content, priority, links, obscured);
			}
			return;
		}
	});

	const handleTitleSubmit = () => {
		setEditingField('content');
	};

	const handleContentSubmit = () => {
		// Enter no longer saves - use Ctrl+S to save
		// This allows multiline notes
	};

	const handleTitleChange = value => {
		setTitle(value);
	};

	const handleContentChange = value => {
		setContent(value);
	};

	const handleLinkUrlSubmit = () => {
		if (isValidUrl(newLinkUrl)) {
			setLinkInputField('title');
		}
	};

	const handleLinkTitleSubmit = () => {
		if (isValidUrl(newLinkUrl)) {
			const newLink = {
				url: newLinkUrl.trim(),
				title: newLinkTitle.trim() || newLinkUrl.trim()
			};
			setLinks([...links, newLink]);
			setAddingLink(false);
			setNewLinkUrl('');
			setNewLinkTitle('');
			setLinkInputField('url');
		}
	};

	const handleDeleteLink = (index) => {
		const updatedLinks = links.filter((_, i) => i !== index);
		setLinks(updatedLinks);
		if (selectedLinkIndex >= updatedLinks.length && updatedLinks.length > 0) {
			setSelectedLinkIndex(updatedLinks.length - 1);
		} else if (updatedLinks.length === 0) {
			setSelectedLinkIndex(0);
		}

		// Auto-save when deleting in view mode
		if (isViewMode && note) {
			onSave(title, content, priority, updatedLinks, obscured);
		}
	};

	const getPriorityColor = priority => {
		const colorMap = {
			high: colors.priorityHigh,
			medium: colors.priorityMedium,
			low: colors.priorityLow,
			none: colors.priorityNone
		};
		return colorMap[priority] || colors.priorityNone;
	};

	if (isViewMode) {
		return (
			<Box
				flexDirection="column"
				width={width}
				height={height}
				paddingX={2}
				paddingY={1}
			>
				<Box borderStyle="single" borderColor={colors.primary} marginBottom={1} paddingX={1} flexDirection="row" alignItems="center" justifyContent="space-between">
					<Text bold color={colors.primary}>
						{title || 'Untitled'}
					</Text>
					<Box flexDirection="row">
						<Text color={colors.primary}>Priority: </Text>
						<Text color={getPriorityColor(priority)} bold>
							{priority}
						</Text>
					</Box>
				</Box>

				<Box
					flexDirection="column"
					flexGrow={1}
					borderStyle="single"
					borderColor={colors.primary}
					paddingX={1}
					paddingY={1}
				>
					<Text color={colors.primary}>{obscured ? '<obscured>' : (content || '(empty)')}</Text>

					{links.length > 0 && (
						<Box flexDirection="column" marginTop={1} >
							<Text bold color={colors.primary}>Links:</Text>
							{links.map((link, index) => {
								const hasDistinctTitle = link.title && link.title !== link.url;
								const isLinkSelected = index === selectedLinkIndex
								return (
									<Box key={index} flexDirection="row">
										{hasDistinctTitle ? (
											<>
												<Text inverse={isLinkSelected} color={colors.primary}>{" "}{link.title}{" "}</Text>
												<Text inverse={isLinkSelected} dimColor>{" "} - {link.url}{" "}</Text>
											</>
										) : (
											<Text inverse={isLinkSelected} color={colors.primary}>{" "}{link.url}{" "}</Text>
										)}
									</Box>
								);
							})}
						</Box>
					)}
				</Box>

				<Box paddingX={1} marginTop={1}>
					<Text dimColor>
						Enter=edit | X=toggle obscured | {links.length > 0 ? '↑/↓=navigate links | O=open link | D=delete link | ' : ''}ESC=back
					</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			width={width}
			height={height}
			paddingX={2}
			paddingY={1}
		>
			<Box borderStyle="single" borderColor={colors.primary} marginBottom={1} paddingX={1} flexDirection="row" alignItems="center" justifyContent="space-between">
				<Box flexGrow={1} flexDirection="row" alignItems="center">
					{editingField === 'title' && !addingLink ? (
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
							<Text inverse color={colors.primary}>
								{" "}{title || 'Untitled'}{" "}
							</Text>
							{!addingLink && (
								<Text color={colors.primary}> (↑ to edit)</Text>
							)}
						</>
					)}
				</Box>
				<Box flexDirection="row">
					<Text color={colors.primary}>Priority: </Text>
					<Text color={getPriorityColor(priority)} bold>{priority}</Text>
					{!addingLink && (
						<Text color={colors.primary} dimColor> (Tab)</Text>
					)}
				</Box>
			</Box>

			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={colors.primary}
				paddingX={1}
				paddingY={1}
			>
				{editingField === 'content' && !addingLink ? (
					<Box flexDirection="column">
						<MultilineInput
							value={content}
							onChange={handleContentChange}
							onSubmit={handleContentSubmit}
							placeholder="Enter note content..."
							focus={true}
						/>
					</Box>
				) : (
					<Box flexDirection="column">
						<Text color={colors.primary}>{content || '(empty)'}</Text>
						{!addingLink && (
							<Text color={colors.primary} marginTop={1}>
								(↓ to edit)
							</Text>
						)}
					</Box>
				)}

				{!addingLink && links.length > 0 && (
					<Box flexDirection="column" marginTop={1} >
						<Text bold color={colors.primary}>Links:</Text>
						{links.map((link, index) => {
							const hasDistinctTitle = link.title && link.title !== link.url;
							return (
								<Box key={index} flexDirection="row">
									{hasDistinctTitle ? (
										<>
											<Text color={colors.primary}>{" "}{link.title}{" "}</Text>
											<Text dimColor>{" "} - {link.url}{" "}</Text>
										</>
									) : (
										<Text color={colors.primary}>{" "}{link.url}{" "}</Text>
									)}
								</Box>
							);
						})}
					</Box>
				)}

				{addingLink && (
					<Box flexDirection="row" gap={1} borderStyle="single" borderColor={colors.primary}>
						<Text bold color={colors.primary}>Add Link</Text>
						<Box flexDirection="row">
							<Box flexDirection="row">
								{linkInputField === 'url' ? (
									<TextInput
										value={newLinkUrl}
										onChange={setNewLinkUrl}
										onSubmit={handleLinkUrlSubmit}
										placeholder="https://example.com"
									/>
								) : (
									<Text color={colors.primary}>{newLinkUrl}</Text>
								)}
							</Box>
							{linkInputField === 'url' && (
								<Box paddingX={1} >
									<Text dimColor>
										{!isValidUrl(newLinkUrl) && newLinkUrl.length > 0 ? '⚠ Invalid URL - must start with http:// or https://' : 'Enter URL and press Enter'}
									</Text>
								</Box>
							)}
						</Box>
						{linkInputField === 'title' && (
							<Box flexDirection="row" >
								<Box flexDirection="row">
									<Text bold color={colors.primary}>Title: </Text>
									<TextInput
										value={newLinkTitle}
										onChange={setNewLinkTitle}
										onSubmit={handleLinkTitleSubmit}
										placeholder="Optional title"
									/>
								</Box>
							</Box>
						)}
					</Box>
				)}
			</Box>

			<Box paddingX={1} marginTop={1}>
				<Text dimColor>
					{addingLink
						? 'Enter URL and title | ESC=cancel link'
						: '↑/↓=switch title/content | Tab=cycle priority | X=toggle obscured | Ctrl+L=add link | ESC=cancel'
					}
				</Text>
				<Text color={colors.primary}>{" "}Ctrl+S=save{" "}</Text>
			</Box>
		</Box>
	);
};

export default NoteEditor;

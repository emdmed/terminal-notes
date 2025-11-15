import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { useScreenSize } from '../hooks/useScreenSize.js';
import { colors } from '../utils/colors.js';

const NoteListView = ({ notes, onView, onEdit, onDelete, onAdd, sortMode, onToggleSort, onChangePriority }) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { height, width } = useScreenSize();

	const maxVisibleNotes = Math.max(1, height - 7);

	const scrollOffset = useMemo(() => {
		if (notes.length <= maxVisibleNotes) {
			return 0;
		}
		const middle = Math.floor(maxVisibleNotes / 2);
		let offset = selectedIndex - middle;
		offset = Math.max(0, offset);
		offset = Math.min(notes.length - maxVisibleNotes, offset);
		return offset;
	}, [selectedIndex, notes.length, maxVisibleNotes]);

	useInput((input, key) => {
		if (input === 'j' && selectedIndex < notes.length - 1) {
			setSelectedIndex(selectedIndex + 1);
		} else if (input === 'k' && selectedIndex > 0) {
			setSelectedIndex(selectedIndex - 1);
		}
		else if (key.downArrow && selectedIndex < notes.length - 1) {
			setSelectedIndex(selectedIndex + 1);
		} else if (key.upArrow && selectedIndex > 0) {
			setSelectedIndex(selectedIndex - 1);
		}
		else if (input === 'g') {
			setSelectedIndex(0);
		} else if (input === 'G') {
			setSelectedIndex(notes.length - 1);
		}
		else if (input === 'i' || input === 'a') {
			onAdd();
		}
		else if (input === 's') {
			onToggleSort();
			setSelectedIndex(0); // Reset to top when sorting changes
		}
		else if (input === '1' && notes.length > 0) {
			onChangePriority(notes[selectedIndex].id, 'high');
		}
		else if (input === '2' && notes.length > 0) {
			onChangePriority(notes[selectedIndex].id, 'medium');
		}
		else if (input === '3' && notes.length > 0) {
			onChangePriority(notes[selectedIndex].id, 'low');
		}
		else if (input === '4' && notes.length > 0) {
			onChangePriority(notes[selectedIndex].id, 'none');
		}
		else if (key.return) {
			if (notes.length > 0) {
				onView(notes[selectedIndex].id);
			}
		}
		else if (input === 'e') {
			if (notes.length > 0) {
				onEdit(notes[selectedIndex].id);
			}
		}
		else if (input === 'd') {
			if (notes.length > 0) {
				onDelete(notes[selectedIndex].id);
			}
		}
	});

	const truncateContent = (content, maxLen) => {
		if (content.length <= maxLen) {
			return content;
		}
		return content.substring(0, maxLen) + '...';
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const getPriorityDisplay = priority => {
		const priorityMap = {
			high: '1',
			medium: '2',
			low: '3',
			none: '-'
		};
		return priorityMap[priority] || '';
	};

	const getPriorityColor = priority => {
		const colorMap = {
			high: colors.highPriority,
			medium: colors.mediumPriority,
			low: colors.lowPriority,
			none: colors.noPriority
		};
		return colorMap[priority] || colors.noPriority;
	};

	if (notes.length === 0) {
		return (
			<Box
				flexDirection="column"
				width={width}
				height={height}
				paddingX={2}
				paddingY={1}
			>
				<Box marginBottom={1}>
					<Text bold color={colors.violet}>
						Terminal Notes
					</Text>
				</Box>
				<Box flexGrow={1} flexDirection="column" justifyContent="center">
					<Text dimColor>No notes yet. Press 'i' to create your first note.</Text>
				</Box>
				<Box borderStyle="single" borderColor="gray" paddingX={1}>
					<Text dimColor>i=insert | q=quit</Text>
				</Box>
			</Box>
		);
	}

	const visibleNotes = notes.slice(
		scrollOffset,
		scrollOffset + maxVisibleNotes,
	);

	const maxContentLen = Math.max(10, width - 60);

	const getSortModeDisplay = () => {
		const sortModeMap = {
			'priority-asc': 'Priority ↑',
			'priority-desc': 'Priority ↓',
			'date-asc': 'Date ↑',
			'date-desc': 'Date ↓'
		};
		return sortModeMap[sortMode] || '';
	};

	return (
		<Box
			flexDirection="column"
			width={width}
			height={height}
			paddingX={2}
			paddingY={1}
		>
			<Box marginBottom={1}>
				<Text bold color={colors.green}>
					Terminal Notes ({notes.length})
				</Text>
				{notes.length > maxVisibleNotes && (
					<Text dimColor>
						{' '}
						[{selectedIndex + 1}/{notes.length}]
					</Text>
				)}
				<Text color={colors.green} dimColor> | Sort: </Text>
				<Text color={colors.green}>{getSortModeDisplay()}</Text>
			</Box>

			<Box flexDirection="column" flexGrow={1}>
				{visibleNotes.map((note, visibleIdx) => {
					const actualIndex = scrollOffset + visibleIdx;
					const isSelected = actualIndex === selectedIndex;
					const priorityDisplay = getPriorityDisplay(note.priority || 'none');
					const priorityColor = getPriorityColor(note.priority || 'none');
					return (
						<Box key={note.id} flexDirection="row" justifyContent="space-between">
							<Box flexDirection="row">
								<Text
									color={colors.green}
									bold={isSelected}
									inverse={isSelected}
								>
									{" "}{note.title} - {truncateContent(note.content, maxContentLen)}
								</Text>
							</Box>
							<Box flexDirection="row">
								{priorityDisplay && (
									<Text inverse={isSelected} color={priorityColor} bold>
										{" "}{priorityDisplay}{" "}
									</Text>
								)}
								<Text inverse={isSelected} color={colors.green}>{formatDate(note.createdAt)}</Text>
							</Box>
						</Box>
					);
				})}
			</Box>

			<Box paddingX={1}>
				<Text dimColor>
					j/k=↓/↑ | g=top | G=bottom | s=sort | 1/2/3/4=priority | i=insert | Enter=view | e=edit | d=delete | q=quit
				</Text>
			</Box>
		</Box>
	);
};

export default NoteListView;

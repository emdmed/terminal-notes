import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useScreenSize} from '../hooks/useScreenSize.js';
import {useTheme} from '../contexts/ThemeContext.js';

const DeleteConfirmation = ({note, onConfirm, onCancel}) => {
	const {height, width} = useScreenSize();
	const {colors} = useTheme();

	useInput((input, key) => {
		if (input === 'd') {
			onConfirm();
		}
		else if (input === 'n' || key.escape || input === 'q') {
			onCancel();
		}
	});

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
			<Box marginBottom={1}>
				<Text inverse color={colors.danger}>
					{" "}{note.title}{" "}
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color={colors.danger}>
					Priority: {note.priority || 'none'}
				</Text>
			</Box>

			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={colors.danger}
				paddingX={1}
				paddingY={1}
			>
				<Text color={colors.danger}>{note.obscured ? '<obscured>' : note.content}</Text>
			</Box>

			<Box marginTop={1}>
				<Text color={colors.danger}>
					Created: {formatDate(note.createdAt)} | Updated:{' '}
					{formatDate(note.updatedAt)}
				</Text>
			</Box>

			<Box paddingX={1} marginTop={1}>
				<Text color={colors.danger}>
					DELETE THIS NOTE? d=delete | n/ESC=cancel
				</Text>
			</Box>
		</Box>
	);
};

export default DeleteConfirmation;

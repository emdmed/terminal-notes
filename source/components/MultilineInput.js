import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

// Memoized line component - only re-renders when its props change
const MemoizedLine = React.memo(({ line, hasCursor, cursorIndex, focus }) => {
	if (!hasCursor || !focus) {
		// No cursor on this line - just render the text
		return <Text>{line}</Text>;
	}

	// Cursor is on this line - render with static cursor highlighting
	const beforeCursor = line.slice(0, cursorIndex);
	const atCursor = line[cursorIndex] || ' ';
	const afterCursor = line.slice(cursorIndex + 1);

	return (
		<Text>
			{beforeCursor}
			<Text inverse>{atCursor}</Text>
			{afterCursor}
		</Text>
	);
});

const MultilineInput = ({ value, onChange, onSubmit, placeholder = '', focus = true }) => {
	const [cursorOffset, setCursorOffset] = useState(value.length);

	// Memoize the input handler to avoid recreation on every render
	const handleInput = useCallback((input, key) => {
		if (!focus) return;

		// Handle Ctrl+S for save
		if (input === 's' && key.ctrl) {
			if (onSubmit) onSubmit();
			return;
		}

		// Handle Enter - insert newline
		if (key.return) {
			const newValue = value.slice(0, cursorOffset) + '\n' + value.slice(cursorOffset);
			onChange(newValue);
			setCursorOffset(cursorOffset + 1);
			return;
		}

		// Handle backspace
		if (key.backspace || key.delete) {
			if (cursorOffset > 0) {
				const newValue = value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
				onChange(newValue);
				setCursorOffset(cursorOffset - 1);
			}
			return;
		}

		// Handle left arrow
		if (key.leftArrow) {
			setCursorOffset(Math.max(0, cursorOffset - 1));
			return;
		}

		// Handle right arrow
		if (key.rightArrow) {
			setCursorOffset(Math.min(value.length, cursorOffset + 1));
			return;
		}

		// Handle up arrow - move to previous line
		if (key.upArrow) {
			const lines = value.slice(0, cursorOffset).split('\n');
			if (lines.length > 1) {
				const currentLinePos = lines[lines.length - 1].length;
				const prevLineLength = lines[lines.length - 2].length;
				const newOffset = cursorOffset - currentLinePos - 1 - (prevLineLength - Math.min(currentLinePos, prevLineLength));
				setCursorOffset(Math.max(0, newOffset));
			}
			return;
		}

		// Handle down arrow - move to next line
		if (key.downArrow) {
			const beforeCursor = value.slice(0, cursorOffset);
			const afterCursor = value.slice(cursorOffset);
			const nextNewline = afterCursor.indexOf('\n');

			if (nextNewline !== -1) {
				const currentLine = beforeCursor.split('\n').pop();
				const currentLinePos = currentLine.length;
				const afterNextNewline = afterCursor.slice(nextNewline + 1);
				const nextLineEnd = afterNextNewline.indexOf('\n');
				const nextLineLength = nextLineEnd === -1 ? afterNextNewline.length : nextLineEnd;

				setCursorOffset(cursorOffset + nextNewline + 1 + Math.min(currentLinePos, nextLineLength));
			}
			return;
		}

		// Handle regular character input
		if (!key.ctrl && !key.meta && input) {
			const newValue = value.slice(0, cursorOffset) + input + value.slice(cursorOffset);
			onChange(newValue);
			setCursorOffset(cursorOffset + input.length);
		}
	}, [focus, value, cursorOffset, onChange, onSubmit]);

	useInput(handleInput, { isActive: focus });

	// Memoize lines array - only recalculate when value changes
	const lines = useMemo(() => value.split('\n'), [value]);

	// Memoize the rendered content - NO showCursor dependency!
	// Only the MemoizedLine components will re-render when showCursor changes
	const renderedContent = useMemo(() => {
		// If empty and no focus, show placeholder
		if (!value && placeholder && !focus) {
			return <Text dimColor>{placeholder}</Text>;
		}

		// If empty and focused, show just the cursor (will be handled by MemoizedLine)
		let charCount = 0;

		return lines.map((line, lineIndex) => {
			const lineStart = charCount;
			const lineEnd = charCount + line.length;

			// Check if cursor is on this line
			const cursorOnThisLine = cursorOffset >= lineStart && cursorOffset <= lineEnd;
			const cursorPosInLine = cursorOnThisLine ? cursorOffset - lineStart : -1;

			charCount = lineEnd + 1; // +1 for the newline character

			return (
				<MemoizedLine
					key={`line-${lineIndex}`}
					line={line}
					hasCursor={cursorOnThisLine}
					cursorIndex={cursorPosInLine}
					focus={focus}
				/>
			);
		});
	}, [value, lines, cursorOffset, focus, placeholder]);

	return (
		<Box flexDirection="column">
			{renderedContent}
		</Box>
	);
};

export default React.memo(MultilineInput);

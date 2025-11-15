# terminal-notes

A vim-style terminal note-taking application built with React and Ink. Features a full TUI (Terminal User Interface) with vim keybindings for efficient note management.

## Features

- **Full TUI Interface** - List view shows all notes with title and preview
- **Vim Keybindings** - Navigate and manage notes using familiar vim controls
- **Priority System** - Organize notes with 4 priority levels (high, medium, low, none)
- **Flexible Sorting** - Sort by priority or date (ascending/descending)
- **View & Edit Modes** - View notes in read-only mode, press Enter to edit
- **Quick Priority Changes** - Press 1/2/3/4 in list view to set priority
- **Quick Navigation** - Jump to top/bottom, scroll through notes
- **Delete with Confirmation** - Safe deletion with dd or confirmation dialog
- **Persistent Storage** - All notes saved in `~/.terminal_notes.json`
- **Timestamps** - Track creation and modification dates
- **Link Management** - Attach URLs to notes, view link count, open in browser
- **Cross-Platform** - Compatible with Arch Linux and Ubuntu

## Install

```bash
npm install --global terminal-notes
```

Or run locally:

```bash
npm install
npm run build
npm start
```

## Usage

Launch the app to see all your notes:

```bash
terminal-notes
```

## Vim Keybindings

### List View (Main Screen)

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down to next note |
| `k` / `↑` | Move up to previous note |
| `g` | Jump to top (first note) |
| `G` | Jump to bottom (last note) |
| `s` | Toggle sort mode (priority ↑/↓, date ↑/↓) |
| `1` | Set selected note priority to high |
| `2` | Set selected note priority to medium |
| `3` | Set selected note priority to low |
| `4` | Set selected note priority to none |
| `i` / `a` | Insert/Add new note |
| `Enter` | View selected note (read-only) |
| `e` | Edit selected note directly |
| `dd` | Delete selected note (quick delete) |
| `q` / `ESC` | Quit application |

### View Mode (Read-Only)

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate through links (if any) |
| `o` | Open selected link in browser |
| `d` / `Del` | Delete selected link |
| `Enter` | Switch to edit mode |
| `ESC` | Return to list |

### Edit Mode

| Key | Action |
|-----|--------|
| `↑` | Switch to title editing |
| `↓` | Switch to content editing |
| `Tab` | Cycle through priorities (high → medium → low → none) |
| `Ctrl+L` | Add a new link to the note |
| `Enter` | Move to next field / Save note |
| `Ctrl+S` | Save note |
| `ESC` | Cancel and return to list |

### Delete Confirmation

| Key | Action |
|-----|--------|
| `y` | Yes, delete the note |
| `n` / `ESC` | No, cancel deletion |

## Interface

When you launch the app, you'll see:

```
Terminal Notes (3) | Sort: Priority ↑

  Welcome to Terminal Notes - This is a vim-style note ta...  1  11/14/2025
  Shopping List - Buy milk, eggs, bread, and c...             2  11/14/2025
  Project Ideas - Build a terminal-based task ...              -  11/14/2025

j/k=↓/↑ | g=top | G=bottom | s=sort | 1/2/3/4=priority | i=insert | Enter=view | e=edit | d=delete | q=quit
```

The priority is shown on the right (1=high, 2=medium, 3=low, -=none) with color coding.

## Managing Links

You can attach URLs to notes for quick reference. Links are displayed with a count indicator (🔗) in the list view.

### Adding Links

1. Open a note in edit mode (`e` or `i`)
2. Press `Ctrl+L` to add a link
3. Enter the URL (must start with http:// or https://)
4. Enter an optional title for the link (or leave blank to use the URL)
5. The link will be saved with the note

### Viewing and Opening Links

1. Open a note in view mode (press `Enter` on a note)
2. If the note has links, they will be displayed at the bottom
3. Use `↑` and `↓` to navigate through links
4. Press `o` to open the selected link in your default browser
5. Press `d` or `Del` to delete the selected link

### Link Display

- In list view: Notes with links show a 🔗 indicator with the count
- In view/edit mode: Links are shown with their title (if provided) and URL
- Selected links are highlighted for easy navigation

## Data Storage

All notes are stored in a JSON file located at:
```
~/.terminal_notes.json
```

Each note contains:
- `id` - Unique identifier
- `title` - Note title
- `content` - Note content/body
- `priority` - Priority level (high, medium, low, none)
- `links` - Array of links with URL and optional title
- `createdAt` - Creation timestamp (ISO 8601)
- `updatedAt` - Last modification timestamp (ISO 8601)

## Development

### Build

Compile the JSX source code:

```bash
npm run build
```

### Watch Mode

Automatically rebuild on file changes:

```bash
npm run dev
```

### Start

Launch the application:

```bash
npm start
```

### Testing

Run tests and linters:

```bash
npm test
```

## Project Structure

```
source/
├── app.js                      # Main application logic
├── cli.js                      # CLI entry point
├── storage.js                  # File I/O operations
└── components/
    ├── NoteListView.js         # Main list view with vim controls
    ├── NoteEditor.js           # Create/edit note form
    └── DeleteConfirmation.js   # Delete confirmation dialog
```

## Technology Stack

- **React 19** - UI component framework
- **Ink 6** - React renderer for interactive CLI applications
- **ink-text-input** - Text input component for forms
- **Babel** - JSX transpilation
- **Node.js built-in modules** - File system operations (fs, path, os)

## Why Vim Keybindings?

Vim-style navigation is efficient and keeps your hands on the home row. No need to reach for arrow keys or mouse. If you're familiar with vim, you'll feel right at home!

## License

MIT

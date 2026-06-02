# Open in Tab Group - Chrome Extension

A Chrome extension that adds a right-click context menu for links, allowing you to open them directly into existing or new tab groups.

**Repository:** [github.com/yhwang/OpenInTabGroup](https://github.com/yhwang/OpenInTabGroup)
**Author:** yhwang
**Version:** 1.0.0

## Project Structure

```
OpenInTabGroup/
├── extension/          # Chrome extension files (load this folder)
│   ├── manifest.json
│   ├── background.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── test/              # Testing utilities
│   ├── test.html
│   └── verify-extension.js
├── design.md          # Design specification
└── README.md          # This file
```

## Features

- **Right-click context menu** for links with "Open link in tab group" option
- **List existing tab groups** from the current window
- **Open links in existing groups** - select any existing tab group to add the link there
- **Create new groups** - open links in a new tab group with one click
- **Automatic menu updates** - menu refreshes when tab groups change
- **Smart labeling** - shows group names with colors for easy identification

## Verification

Before loading the extension, you can run the verification script to check all files:

```bash
node test/verify-extension.js
```

This will verify:
- All required files exist in the extension folder
- manifest.json is valid and properly configured
- background.js contains all required functions
- Icon files are present

## Installation

### Load as Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the **`extension`** directory (not the root directory)
5. The extension should now appear in your extensions list

## Usage

### Opening a Link in an Existing Tab Group

1. Right-click any link on a webpage
2. Hover over **"Open link in tab group"**
3. Select an existing tab group from the submenu
4. The link opens in a new tab and is automatically added to the selected group

### Opening a Link in a New Tab Group

1. Right-click any link on a webpage
2. Hover over **"Open link in tab group"**
3. Select **"New group"**
4. The link opens in a new tab within a newly created tab group

## Testing

### Manual Test Cases

#### Test 1: Menu Rendering with No Groups
1. Close all tab groups in your current window
2. Right-click any link
3. Verify "Open link in tab group" appears
4. Verify submenu contains only "New group"

#### Test 2: Menu Shows Existing Groups
1. Create 2-3 tab groups in your current window (right-click tabs → "Add tab to new group")
2. Give them different names and colors
3. Right-click any link
4. Verify all groups appear in the submenu with their names and colors

#### Test 3: Open Link in Existing Group
1. Create a tab group named "Test Group"
2. Right-click any link
3. Select "Test Group" from the submenu
4. Verify:
   - New tab opens with the link
   - Tab is added to "Test Group"

#### Test 4: Open Link in New Group
1. Right-click any link
2. Select "New group"
3. Verify:
   - New tab opens with the link
   - A new tab group is created containing that tab

#### Test 5: Using the Test Page
1. Open `test/test.html` in Chrome
2. Follow the interactive testing instructions on the page
3. Use the provided test links to verify functionality

#### Test 5: Untitled Groups
1. Create a tab group without giving it a title
2. Right-click any link
3. Verify the group appears as "Unnamed group (color)"

#### Test 6: Duplicate Group Names
1. Create two groups with the same name but different colors
2. Right-click any link
3. Verify both groups appear with distinguishable labels (name + color)

#### Test 7: Menu Updates on Group Changes
1. Right-click a link and note the groups shown
2. Create a new tab group
3. Right-click a link again
4. Verify the new group appears in the menu

## Architecture

### Files

- **`extension/manifest.json`** - Extension configuration (Manifest V3)
- **`extension/background.js`** - Service worker handling context menus and tab group operations
- **`extension/icons/`** - Extension icons (16x16, 48x48, 128x128)
- **`test/test.html`** - Interactive test page
- **`test/verify-extension.js`** - Automated verification script

### Key Functions

- `rebuildContextMenus()` - Rebuilds the context menu based on current tab groups
- `handleContextMenuClick()` - Handles menu item clicks
- `openLinkInExistingGroup()` - Opens a link in a specified tab group
- `openLinkInNewGroup()` - Opens a link in a new tab group
- `formatGroupLabel()` - Formats group names with color information

### Chrome APIs Used

- **`chrome.contextMenus`** - Create and manage context menu items
- **`chrome.tabs`** - Create tabs and manage tab grouping
- **`chrome.tabGroups`** - Query and manage tab groups
- **`chrome.windows`** - Detect window focus changes

## Permissions

The extension requires the following permissions:

- `contextMenus` - To add the right-click menu
- `tabs` - To create and group tabs
- `tabGroups` - To query and manage tab groups

No host permissions are required as the extension only uses link URLs from context menu events.

## Design

See [`design.md`](design.md) for the complete design specification.

## Version

**1.0.0** - Initial release

## Future Enhancements

Potential features for future versions:

- Options page for default group settings
- Cross-window tab group support
- Keyboard shortcuts
- Open multiple links at once
- Domain-based automatic grouping
- Recently used groups at top of menu

## Troubleshooting

For detailed troubleshooting steps and solutions to common issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Quick Fixes

**Extension not working?**
1. Check the service worker console: `chrome://extensions/` → Find extension → Click "service worker"
2. Look for error messages or warnings
3. Reload the extension

**Menu appears but nothing happens?**
- Check the service worker console for detailed logs
- The latest version includes enhanced logging with ✅ success indicators
- Try clicking again - the menu may need to rebuild

**Intermittent issues?**
- The latest version includes several fixes for timing and race conditions
- Make sure you have the latest version
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on [GitHub](https://github.com/yhwang/OpenInTabGroup).

## License

This extension is provided as-is for educational and practical use.

## Links

- **GitHub Repository:** https://github.com/yhwang/OpenInTabGroup
- **Issues:** https://github.com/yhwang/OpenInTabGroup/issues
- **Author:** yhwang
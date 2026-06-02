# Open in Tab Group

A Chrome extension that allows you to open links directly into existing or new tab groups via right-click context menu.

## Features

- Right-click any link to open it in a tab group
- Choose from existing tab groups in the current window
- Create a new tab group for the link
- Groups are labeled with their title and color for easy identification
- Tabs open in the background to avoid disrupting your workflow

## Installation

### From Chrome Web Store
[Link to be added when published]

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` directory

## Development

### Prerequisites
- Node.js (for linting tools)

### Setup
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Linting Configuration

This project uses:
- **ESLint** for JavaScript code quality and consistency
- **Prettier** for automatic code formatting
- **GitHub Actions** for automated CI/CD linting checks

Key linting rules:
- Chrome Extension API globals (`chrome`) are recognized
- ES2021+ features supported
- Single quotes preferred
- 2-space indentation
- Semicolons required
- Max line length: 120 characters
- Console statements allowed (for debugging)

#### Continuous Integration
The project includes a GitHub Actions workflow ([`.github/workflows/lint.yml`](.github/workflows/lint.yml:1)) that automatically:
- Runs ESLint and Prettier checks on all pull requests to `main`
- Runs checks on pushes to `main` branch
- Prevents merging of code with linting or formatting issues

### Project Structure
```
.
├── extension/
│   ├── background.js      # Service worker with context menu logic
│   ├── manifest.json      # Extension manifest
│   └── icons/            # Extension icons
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── package.json          # npm dependencies and scripts
└── README.md            # This file
```

## How It Works

1. The extension creates a context menu item "Open link in tab group" when you right-click on any link
2. The submenu shows all existing tab groups in the current window
3. Select a group to open the link in that group, or choose "New group" to create a new one
4. The extension automatically handles group creation and tab management

## Technical Details

- Uses Chrome Extension Manifest V3
- Service worker-based background script
- Debounced menu rebuilding to optimize performance
- Retry logic for reliable tab grouping
- Window-aware group management

## Contributing

Contributions are welcome! Please ensure your code:
1. Passes ESLint checks (`npm run lint`)
2. Is formatted with Prettier (`npm run format`)
3. Follows the existing code style
4. Includes appropriate error handling

## License

MIT

## Author

yhwang

## Repository

https://github.com/yhwang/OpenInTabGroup
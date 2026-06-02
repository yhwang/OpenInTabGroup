# Changelog

All notable changes to the "Open in Tab Group" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-06-02

### Fixed
- **Enhanced reliability for rare failure cases** where clicking a tab group menu item would not open the link
  - Added retry logic with exponential backoff (up to 3 attempts) for both existing and new group operations
  - Added tab existence validation before grouping operations
  - Added group existence validation before each retry attempt
  - Improved error handling with fallback to open link without grouping if all attempts fail
  - Better diagnostic logging to track retry attempts and failure reasons
- **Fixed issue with newly opened pages** where menu items weren't available
  - Service worker now initializes menus immediately on wake-up
  - Menu click handler rebuilds menus and retries if menu data not found
  - Added intelligent menu ID parsing as last resort fallback
  - Ensures menus are always available even on fresh page loads

### Changed
- Improved error messages to include attempt numbers for better debugging
- Enhanced fallback behavior: if grouping fails completely, the link still opens in a new tab
- Added exponential backoff delays (100ms, 200ms, 300ms) between retry attempts
- Menu click handler now waits for rebuild completion before retrying
- Added 150ms settling delay after menu rebuild for stability

### Technical Details
The rare failure was caused by multiple timing issues:
1. **Service worker wake-up delay** - Menus not built when user right-clicks on newly opened page
2. **Tab creation timing** - Tab wasn't fully created before grouping was attempted
3. **Stale group references** - Group removed between menu build and click
4. **Race conditions** - Chrome's internal tab/group management conflicts

The new implementation addresses all these scenarios:
- Service worker checks and builds menus on initialization
- Menu click handler rebuilds and retries if data missing
- Intelligent fallback parsing of menu IDs
- Retry logic with validation checks
- Multiple layers of fallback ensure link always opens

## [1.0.0] - 2026-06-02

### Added
- Initial release of Open in Tab Group extension
- Right-click context menu for links
- List all tab groups in current window
- Open links in existing tab groups
- Create new tab groups with links
- Smart menu rebuilding with debouncing (100ms)
- State tracking to avoid unnecessary menu updates
- Graceful error handling and validation
- Tiered logging (log/debug/warn/error)
- Comprehensive documentation (README, TROUBLESHOOTING, PUBLISHING)

### Features
- Manifest V3 architecture with service worker
- Context menu integration for links only
- Window-scoped tab group listing
- Automatic menu refresh on group changes
- Fallback labels for untitled groups
- Color-based group identification
- Separator before "New group" option

### Technical Highlights
- Debounced menu rebuilds prevent duplicate ID errors
- Group state tracking (title/color) minimizes unnecessary updates
- Window validation ensures correct group listing
- Group existence validation before operations
- Comprehensive error handling with fallbacks
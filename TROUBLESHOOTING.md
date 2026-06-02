# Troubleshooting Guide - Open in Tab Group Extension

This guide helps diagnose and fix common issues with the extension.

## How to Check Extension Logs

1. Open `chrome://extensions/`
2. Find "Open in Tab Group"
3. Click on **"service worker"** (or "Inspect views: service worker")
4. This opens the DevTools console for the extension
5. Look for error messages or warnings

## Common Issues and Solutions

### Issue 1: Context Menu Not Appearing

**Symptoms:**
- Right-clicking a link doesn't show "Open link in tab group"

**Solutions:**
1. Verify the extension is enabled in `chrome://extensions/`
2. Check that you're right-clicking on an actual link (not text or images)
3. Reload the extension:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
4. Check the service worker console for errors

### Issue 2: Menu Appears But Nothing Happens When Clicked

**Symptoms:**
- Menu shows up correctly
- Clicking a menu item does nothing
- No new tab opens

**Possible Causes & Solutions:**

#### A. Service Worker Restarted
The service worker may have restarted and lost its state.

**Solution:**
1. Open the service worker console (see above)
2. Look for the message: "Unknown menu item clicked"
3. If you see this, the menu needs to rebuild
4. Try clicking the menu item again - it should work the second time
5. If the problem persists, reload the extension

#### B. Tab Group Was Deleted
The group you selected may have been deleted after the menu was built.

**Solution:**
1. Check the service worker console for: "Group X no longer exists"
2. The extension should automatically open the link in a new group instead
3. If nothing happens, try selecting a different group or "New group"

#### C. Window Focus Issue
The extension might be targeting the wrong window.

**Solution:**
1. Make sure you're clicking the menu in the same window where you want the tab to open
2. Try clicking in the browser window first to ensure it has focus
3. Then right-click the link and select the menu item

### Issue 3: Tab Opens But Isn't Added to Group

**Symptoms:**
- New tab opens successfully
- Tab is not added to the selected group

**Solutions:**
1. Check the service worker console for grouping errors
2. Verify the target group still exists
3. Try these steps:
   - Close and reopen the browser
   - Reload the extension
   - Create a new tab group and try again

### Issue 4: Intermittent Failures

**Symptoms:**
- Sometimes works, sometimes doesn't
- No consistent pattern

**Recent Improvements:**
The latest version includes several fixes for intermittent issues:
- Better window detection using `getLastFocused()`
- Validation that groups exist before adding tabs
- Small delays to ensure tabs are fully created
- Automatic fallback to new group if target group is deleted
- Enhanced logging for debugging

**Solutions:**
1. Make sure you have the latest version of the extension
2. Reload the extension in `chrome://extensions/`
3. Check the service worker console for detailed logs
4. Look for these success messages:
   - `✅ Tab X successfully added to group Y`
   - `✅ New group X created with tab Y`

### Issue 5: Groups Not Showing in Menu

**Symptoms:**
- Menu only shows "New group"
- Your existing groups don't appear

**Solutions:**
1. Verify you have tab groups in the current window
2. Tab groups are window-specific - groups in other windows won't show
3. Try creating a new tab group:
   - Right-click any tab
   - Select "Add tab to new group"
   - Give it a name
4. The menu should update automatically
5. If not, reload the extension

## Debugging Steps

If you're experiencing issues, follow these steps:

### Step 1: Enable Detailed Logging
The extension now includes detailed console logging. Open the service worker console to see:
- When menus are rebuilt
- When menu items are clicked
- Tab creation and grouping operations
- Any errors that occur

### Step 2: Test Basic Functionality
1. Create a test tab group:
   - Right-click any tab → "Add tab to new group"
   - Name it "Test Group"
2. Open `test/test.html` in Chrome
3. Right-click any link
4. Verify "Open link in tab group" appears
5. Verify "Test Group" appears in the submenu
6. Click "Test Group"
7. Check the service worker console for logs

### Step 3: Check for Specific Error Messages

Look for these in the service worker console:

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "No link URL provided" | Context menu wasn't triggered on a link | Right-click on an actual link |
| "Invalid tab information" | Tab data is missing | Reload the extension |
| "Unknown menu item clicked" | Menu state was lost | Click again or reload extension |
| "Group X no longer exists" | Target group was deleted | Select a different group |
| "Failed to create tab" | Tab creation failed | Check browser permissions |
| "Error adding tab to group" | Grouping operation failed | Try again or reload extension |

### Step 4: Verify Extension Permissions
1. Go to `chrome://extensions/`
2. Find "Open in Tab Group"
3. Click "Details"
4. Verify these permissions are granted:
   - Context menus
   - Tabs
   - Tab groups

### Step 5: Test in Incognito Mode
1. Go to `chrome://extensions/`
2. Find "Open in Tab Group"
3. Enable "Allow in incognito"
4. Open an incognito window
5. Test the extension
6. If it works in incognito but not in normal mode, there may be a conflict with another extension

## Reporting Issues

If you've tried all the above and still have issues, please provide:

1. **Chrome version**: Check `chrome://version/`
2. **Extension version**: Check `chrome://extensions/`
3. **Console logs**: Copy relevant messages from the service worker console
4. **Steps to reproduce**: Exact steps that cause the issue
5. **Expected vs actual behavior**: What should happen vs what actually happens

## Performance Tips

- The extension is lightweight and shouldn't impact browser performance
- Menus rebuild automatically when groups change
- Service worker may sleep when inactive (this is normal Chrome behavior)
- First click after service worker wakes may take slightly longer

## Known Limitations

1. **Window-specific**: Only shows groups from the current window
2. **No cross-window support**: Can't move tabs between windows
3. **No group management**: Can't rename or delete groups from the extension
4. **Background tabs**: New tabs open in the background by default

## Getting Help

1. Check this troubleshooting guide first
2. Review the [README.md](README.md) for basic usage
3. Check the service worker console for error messages
4. Try the test page at `test/test.html`
5. Reload the extension as a first troubleshooting step

## Recent Fixes (Latest Version)

The latest version includes these improvements:
- ✅ Better window detection to prevent targeting wrong window
- ✅ Validation that groups exist before attempting to add tabs
- ✅ Small delays to ensure tabs are fully created before grouping
- ✅ Automatic fallback to new group if target group is deleted
- ✅ Enhanced logging for easier debugging
- ✅ Better error handling throughout
- ✅ Menu state recovery if service worker restarts

If you're experiencing intermittent issues, make sure you have the latest version!
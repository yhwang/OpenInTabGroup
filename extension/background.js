// Constants
const PARENT_MENU_ID = 'open-link-in-group';
const NEW_GROUP_MENU_ID = 'new-group';
const SEPARATOR_ID = 'separator';
const GROUP_MENU_PREFIX = 'group-';

// Store menu item to group ID mapping
const menuItemMap = new Map();

// Track group states to detect meaningful changes
const groupStates = new Map();

// Debouncing variables
let rebuildTimeout = null;
let isRebuilding = false;

/**
 * Debounced rebuild function to prevent multiple simultaneous rebuilds
 */
function scheduleRebuild() {
  // Clear any pending rebuild
  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }

  // Schedule a new rebuild after a short delay
  rebuildTimeout = setTimeout(() => {
    rebuildContextMenus();
  }, 100);
}

/**
 * Initialize the extension on install or startup
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Extension installed');
  scheduleRebuild();
});

chrome.runtime.onStartup.addListener(() => {
  console.debug('Browser started, initializing extension...');
  scheduleRebuild();
});

// Ensure menus are built when service worker wakes up
// This handles the case where user right-clicks on a newly opened page
if (menuItemMap.size === 0) {
  console.debug('Service worker initialized, building menus...');
  scheduleRebuild();
}

/**
 * Listen for tab group changes to rebuild menus
 */
chrome.tabGroups.onCreated.addListener(() => {
  console.debug('Tab group created, scheduling menu rebuild...');
  scheduleRebuild();
});

chrome.tabGroups.onUpdated.addListener((group) => {
  // Check if title or color actually changed
  const previousState = groupStates.get(group.id);
  const currentState = { title: group.title, color: group.color };

  if (!previousState || previousState.title !== currentState.title || previousState.color !== currentState.color) {
    // Title or color changed - rebuild menu
    console.debug('Tab group title/color changed, scheduling menu rebuild...');
    groupStates.set(group.id, currentState);
    scheduleRebuild();
  } else {
    // Only collapsed state or other non-menu properties changed
    console.debug('Tab group updated (collapsed/position), skipping rebuild');
  }
});

chrome.tabGroups.onRemoved.addListener((groupId) => {
  console.debug('Tab group removed, scheduling menu rebuild...');
  // Clean up tracked state
  groupStates.delete(groupId);
  scheduleRebuild();
});

// Note: We don't listen to window focus changes because:
// 1. Tab groups can't change when Chrome doesn't have focus
// 2. The menu already shows groups from the current window
// 3. This avoids unnecessary rebuilds when switching applications

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});

/**
 * Get the current active window ID
 * Uses getLastFocused to ensure we get the window with focus
 */
async function getCurrentWindowId() {
  try {
    const window = await chrome.windows.getLastFocused({ populate: false });
    return window.id;
  } catch (error) {
    console.error('Error getting current window:', error);
    return null;
  }
}

/**
 * Get all tab groups for a specific window
 */
async function getTabGroupsForWindow(windowId) {
  try {
    const groups = await chrome.tabGroups.query({ windowId });
    return groups;
  } catch (error) {
    console.error('Error querying tab groups:', error);
    return [];
  }
}

/**
 * Format a group label for display in the menu
 */
function formatGroupLabel(group) {
  const colorName = group.color || 'grey';

  if (group.title && group.title.trim()) {
    // If there's a title, show it with color
    return `${group.title} (${colorName})`;
  } else {
    // If no title, show "Unnamed group" with color
    return `Unnamed group (${colorName})`;
  }
}

/**
 * Rebuild all context menu items
 */
async function rebuildContextMenus() {
  // Prevent concurrent rebuilds
  if (isRebuilding) {
    console.debug('Rebuild already in progress, skipping...');
    return;
  }

  isRebuilding = true;

  try {
    console.debug('Starting menu rebuild...');

    // Clear existing menus
    await chrome.contextMenus.removeAll();
    menuItemMap.clear();

    // Get current window ID
    const windowId = await getCurrentWindowId();
    if (!windowId) {
      console.error('Could not determine current window');
      return;
    }

    // Create parent menu item
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Open link in tab group',
      contexts: ['link']
    });

    // Get tab groups for current window
    const groups = await getTabGroupsForWindow(windowId);

    // Create menu items for each existing group
    for (const group of groups) {
      const menuId = `${GROUP_MENU_PREFIX}${group.id}`;
      const label = formatGroupLabel(group);

      chrome.contextMenus.create({
        id: menuId,
        parentId: PARENT_MENU_ID,
        title: label,
        contexts: ['link']
      });

      // Store mapping
      menuItemMap.set(menuId, {
        type: 'existing-group',
        groupId: group.id
      });

      // Track group state for change detection
      groupStates.set(group.id, {
        title: group.title,
        color: group.color
      });
    }

    // Add separator before "New group" if there are existing groups
    if (groups.length > 0) {
      chrome.contextMenus.create({
        id: SEPARATOR_ID,
        parentId: PARENT_MENU_ID,
        type: 'separator',
        contexts: ['link']
      });
    }

    // Create "New group" menu item
    chrome.contextMenus.create({
      id: NEW_GROUP_MENU_ID,
      parentId: PARENT_MENU_ID,
      title: 'New group',
      contexts: ['link']
    });

    menuItemMap.set(NEW_GROUP_MENU_ID, {
      type: 'new-group'
    });

    console.log(`✅ Context menus rebuilt successfully with ${groups.length} existing groups`);
  } catch (error) {
    console.error('❌ Error rebuilding context menus:', error);
  } finally {
    isRebuilding = false;
  }
}

/**
 * Handle context menu click events
 */
async function handleContextMenuClick(info, tab) {
  console.debug('Context menu clicked:', { menuItemId: info.menuItemId, linkUrl: info.linkUrl, tabId: tab?.id });

  const linkUrl = info.linkUrl;

  if (!linkUrl) {
    console.warn('No link URL provided in context menu click');
    return;
  }

  if (!tab || !tab.windowId) {
    console.error('Invalid tab information:', tab);
    return;
  }

  const menuItemId = info.menuItemId;
  let menuData = menuItemMap.get(menuItemId);

  // If menu data not found, rebuild and retry once
  if (!menuData) {
    console.warn('Menu item not found in map, rebuilding menus...');
    console.debug('Available menu items before rebuild:', Array.from(menuItemMap.keys()));

    // Wait for rebuild to complete
    await rebuildContextMenus();

    // Give it a moment to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Try to get menu data again
    menuData = menuItemMap.get(menuItemId);

    if (!menuData) {
      console.error('Menu item still not found after rebuild:', menuItemId);
      console.debug('Available menu items after rebuild:', Array.from(menuItemMap.keys()));

      // Last resort: try to parse the menu ID to determine action
      if (menuItemId === NEW_GROUP_MENU_ID) {
        console.warn('Detected "New group" action from menu ID, proceeding...');
        menuData = { type: 'new-group' };
      } else if (menuItemId.startsWith(GROUP_MENU_PREFIX)) {
        const groupId = parseInt(menuItemId.replace(GROUP_MENU_PREFIX, ''));
        if (!isNaN(groupId)) {
          console.warn(`Detected existing group action (ID: ${groupId}) from menu ID, proceeding...`);
          menuData = { type: 'existing-group', groupId: groupId };
        }
      }

      if (!menuData) {
        console.error('Unable to determine action, opening link without grouping');
        try {
          await chrome.tabs.create({ url: linkUrl, windowId: tab.windowId });
        } catch (fallbackError) {
          console.error('Failed to open link:', fallbackError);
        }
        return;
      }
    }
  }

  try {
    if (menuData.type === 'existing-group') {
      await openLinkInExistingGroup(linkUrl, menuData.groupId, tab);
    } else if (menuData.type === 'new-group') {
      await openLinkInNewGroup(linkUrl, tab);
    }
  } catch (error) {
    console.error('Error handling menu click:', error);
    // Ensure tab opens even if grouping fails
    try {
      console.warn('Attempting to open link without grouping as fallback');
      await chrome.tabs.create({ url: linkUrl, windowId: tab.windowId });
    } catch (fallbackError) {
      console.error('Fallback tab creation also failed:', fallbackError);
    }
  }
}

/**
 * Open a link in an existing tab group
 */
async function openLinkInExistingGroup(url, groupId, sourceTab) {
  console.debug(`Opening ${url} in group ${groupId} from window ${sourceTab.windowId}`);

  try {
    // Verify the group still exists before creating the tab
    let group;
    try {
      group = await chrome.tabGroups.get(groupId);
      console.debug(`Group ${groupId} exists:`, group.title || 'Untitled');
    } catch (groupCheckError) {
      console.error(`Group ${groupId} no longer exists, opening in new group instead`);
      await openLinkInNewGroup(url, sourceTab);
      return;
    }

    // Create new tab in the same window as the source tab
    const newTab = await safeCreateTab(url, sourceTab.windowId);

    if (!newTab) {
      console.error('Failed to create tab');
      return;
    }

    // Add a small delay to ensure tab is fully created
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Try to add the tab to the group with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let grouped = false;

    while (retryCount < maxRetries && !grouped) {
      try {
        // Verify group still exists before each attempt
        await chrome.tabGroups.get(groupId);

        // Verify tab still exists
        const tabCheck = await chrome.tabs.get(newTab.id);
        if (!tabCheck) {
          console.error('Tab no longer exists');
          return;
        }

        await chrome.tabs.group({
          tabIds: [newTab.id],
          groupId: groupId
        });

        grouped = true;
        console.log(`✅ Tab added to group ${groupId} (attempt ${retryCount + 1})`);
      } catch (groupError) {
        retryCount++;
        console.warn(`Attempt ${retryCount} to group tab failed:`, groupError.message);

        if (retryCount < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
        } else {
          console.error('All grouping attempts failed:', groupError);
          console.warn('Tab opened but not grouped');
        }
      }
    }
  } catch (error) {
    console.error('Error opening link in existing group:', error);
    throw error; // Re-throw to trigger fallback in handleContextMenuClick
  }
}

/**
 * Open a link in a new tab group
 */
async function openLinkInNewGroup(url, sourceTab) {
  console.debug(`Opening ${url} in new group from window ${sourceTab.windowId}`);

  try {
    // Create new tab in the same window as the source tab
    const newTab = await safeCreateTab(url, sourceTab.windowId);

    if (!newTab) {
      console.error('Failed to create tab');
      throw new Error('Failed to create tab');
    }

    // Add a small delay to ensure tab is fully created
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a new group with this tab with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let grouped = false;

    while (retryCount < maxRetries && !grouped) {
      try {
        // Verify tab still exists
        const tabCheck = await chrome.tabs.get(newTab.id);
        if (!tabCheck) {
          console.error('Tab no longer exists');
          return;
        }

        const groupId = await chrome.tabs.group({
          tabIds: [newTab.id]
        });

        grouped = true;
        console.log(`✅ New group created with ID ${groupId} (attempt ${retryCount + 1})`);
      } catch (groupError) {
        retryCount++;
        console.warn(`Attempt ${retryCount} to create group failed:`, groupError.message);

        if (retryCount < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
        } else {
          console.error('All group creation attempts failed:', groupError);
          console.warn('Tab opened but not grouped');
        }
      }
    }
  } catch (error) {
    console.error('Error opening link in new group:', error);
    throw error; // Re-throw to trigger fallback in handleContextMenuClick
  }
}

/**
 * Safely create a new tab with error handling
 */
async function safeCreateTab(url, windowId) {
  try {
    console.debug(`Creating tab for ${url} in window ${windowId}`);
    const tab = await chrome.tabs.create({
      url: url,
      windowId: windowId,
      active: false // Open in background
    });
    console.debug(`Tab created: ${tab.id}`);
    return tab;
  } catch (error) {
    console.error('Error creating tab:', error);
    return null;
  }
}

# SyncLine Chrome Extension

## Overview

SyncLine is a Chrome extension that works in tandem with a VS Code extension to synchronize the **Line Identifier** between both platforms. The Line Identifier is used to map UI elements on the web page to the corresponding code in a VS Code project. When hovering over a UI element in the Chrome browser, a tooltip displays the **Line Identifier** and **file path** of the associated code in VS Code.

If you change the Line Identifier in either the Chrome extension or the VS Code extension, it **must be manually updated** in the other; they will not automatically sync.

## Features

- **Line Identifier Configuration:**
  - **Chrome Extension**: Users can set a custom Line Identifier via the settings page.
  - **VS Code Extension**: Users can change the Line Identifier via a Quick Pick menu in VS Code.
  - Defaults to **LineNumber** if no custom identifier is provided.
- **Tooltip on Hover:**

  - The Chrome extension detects UI elements on the web page and shows a tooltip displaying the Line Identifier and the file path of the code in VS Code.

- **Manual Synchronization:**
  - If you change the Line Identifier in one extension (VS Code or Chrome), you must manually update it in the other extension for the system to work properly.

## How It Works

1. **Chrome Extension:**

   - Users can type a custom Line Identifier in the settings page.
   - When hovering over any UI element on a page, the Chrome extension fetches the corresponding Line Identifier and file path from the VS Code extension.
   - A tooltip is displayed showing both pieces of information.

2. **VS Code Extension:**
   - Users can open the Command Palette and select the "Change Line Identifier" option to modify the Line Identifier.
   - The extension maps UI elements in the code to the updated Line Identifier.
   - The updated Line Identifier and file path are shared with the Chrome extension to be displayed when hovering over elements.

## Installation

### 1. **Chrome Extension**

1. Go to the Chrome Web Store. Search for the Extension:
2. Use the search bar at the top left to search for the extension by name("SyncLine) Select the Extension:
3. Click on the extension to install from the search results. Click "Add to Chrome":
4. On the extension page, click the "Add to Chrome" button. Confirm the Installation:
5. A pop-up will appear asking for permission to install the extension. Review the permissions and click "Add Extension" to confirm. Wait for Installation:
6. Chrome will automatically download and install the extension. Once the installation is complete, you should see the extension icon in the top-right corner of the browser (next to the address bar).

### 2. **VS Code Extension**

1. Install the VS Code extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/) or clone this repository and manually install it.
2. Open VS Code, and the extension should automatically be added to your workspace.

## How to Use

### Chrome Extension

1. Click on the SyncLine icon in the Chrome toolbar to open the popup.
2. Type your custom Line Identifier in the settings page (optional).
3. When hovering over any UI element in the browser, a tooltip will show the corresponding **Line Identifier** and **file path**.

### VS Code Extension

1. Open the Command Palette (press `Ctrl + Shift + P` or `Cmd + Shift + P` on Mac).
2. Type `Change Line Identifier` and select it to modify the Line Identifier.
3. The updated Line Identifier will be used when you hover over corresponding UI elements in the Chrome browser.

## Important Notes

- **Manual Syncing**: Changes made to the Line Identifier in either the Chrome or VS Code extension **must be manually updated** in the other extension. The extensions do not automatically sync changes to the Line Identifier.
- If you do not provide a custom Line Identifier, **LineNumber** will be used by default.

## Future Improvements

- **Automatic Synchronization**: Implementing a feature to automatically sync the Line Identifier across both extensions.
- **Additional Tooltip Information**: Include more information in the tooltip such as the specific function or variable associated with the UI element.

## License

This project is licensed under a custom license. See the [LICENSE](LICENSE) file for details.

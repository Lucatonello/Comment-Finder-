# YouTube Comment Finder Extension

A Chrome extension that allows you to search for YouTube video comments containing a specific keyword, directly from the YouTube page. Built with React, TypeScript, JavaScript and Vite.

## Features
- Search for any keyword in the comments of the currently open YouTube video.
- Results are displayed as a popup overlay on the YouTube page, styled to match YouTube's look.
- Shows commenter profile image, username, channel link, like count, reply count, and published date ("time ago").
- Handles pagination to fetch all top-level comments (not just the first 100).
- Fetches and displays replies to comments on demand, with reply author, profile picture, like count, and published date.
- Replies are shown in a YouTube-like format: profile picture left, author and time right, comment below, like count below comment.
- Loading spinners and "no results"/"no replies" states for better UX.
- Smooth popup open/close animations.
- Clean, modern UI for the extension popup and injected results.

## How It Works
1. Open a YouTube video in your browser.
2. Click the extension icon to open the popup.
3. Enter a keyword and click "Search".
4. The extension fetches all comments for the video, filters them by your keyword, and displays the results as a popup on the YouTube page.
5. Click the reply count on any comment to fetch and view all replies for that comment.

## Local Installation
1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the project.
4. Ensure `content.js`, `background.js`, and all icons are present in the output directory.
5. Load the `dist` (or `public`) directory as an unpacked extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the build output directory

## Development
- Run `npm run dev` to start the Vite development server for the React popup.
- Edit `src/content.js` (or `public/content.js`) for the content script logic.
- Edit `src/App.tsx` for the popup UI logic.
- Edit `public/background.js` for background API logic.

## Configuration
- The YouTube Data API key is stored in `src/App.tsx` and `public/background.js` as `API_KEY`. Restrict this key in the Google Cloud Console for security.
- The extension only requests permissions for YouTube tabs and scripting.

## File Structure
- `src/` — React popup source code
- `public/` — Static files, content script, background script, and manifest
- `dist/` — Build output (for loading as an unpacked extension)

## Permissions
- `tabs`, `activeTab`, `scripting` — For accessing the current tab and injecting the popup
- `host_permissions` — Only for `https://www.youtube.com/*`

## Known Limitations
- API quota limits apply (YouTube Data API v3).
- The API key is exposed in the client code (standard for browser extensions, but restrict it in Google Cloud Console).

## License
MIT

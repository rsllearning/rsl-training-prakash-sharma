# ReactJS Todo Assignment

A complete React + Vite implementation of the supplied Todo assignment. The UI follows the prototype's white layout, teal input area, TodoInput/TodoList headings, three equal-width filters, and bordered task rows. Text buttons replace the prototype's action icons, as permitted in the brief.

## Run locally

Install Node.js 22.12 or newer (Node.js 24 LTS recommended), then open a terminal in this folder:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal, normally **http://127.0.0.1:5173**. On Windows, you can also double-click **Start-App.cmd** after installing Node.js. It installs missing dependencies and opens the app.

```sh
npm run build    # Create the production build in dist/
npm run preview  # Preview that build, normally on port 4173
```

The included `dist/` is a ready-built copy. Serve it with a static web server; opening `index.html` directly as a file is not supported. No backend, API key, or environment file is required.

## Features and assignment rules

| Requirement | Implementation |
| --- | --- |
| Add a todo | Enter any description and click Add new task, or press Enter. New tasks append to the end. |
| No description validation | Empty descriptions, spaces, symbols, Unicode, and long strings are accepted without trimming or a character limit. |
| Edit a pending todo | Edit opens the existing description in an inline input. Cancel discards the draft; Confirm saves it. Enter confirms; Escape cancels. |
| Complete a todo | Tick its checkbox. The description turns green with a strikethrough, and the task moves above pending tasks. |
| Completed task restrictions | A completed checkbox is checked and disabled. Edit is hidden. Delete remains available. The state reducer also prevents editing or reopening completed tasks. |
| Delete a todo | Pending and completed tasks can be deleted. A dialog offers Cancel or Confirm delete. Escape cancels. |
| Ordering | Completed tasks first, then pending tasks. Creation order is preserved within each group. |
| Filters | All = every task; Done = completed; Todo = pending. Exactly one is selected, with CSS opacity 0.6. All is selected initially. |
| Empty list | Shows exactly "No todo is available". Filter buttons are hidden when there are no tasks. |
| Empty filter result | Shows the same empty message but keeps filters available so you can switch back. |
| Prototype placement | Filters appear directly below the TodoList heading and above the task rows, matching the supplied sample screen. |
| Responsive UI | Layout adapts to mobile; long descriptions wrap without overflowing the page. |

Adding a task returns to All so the new pending task is immediately visible. There are no preloaded example tasks on first use.

As a small enhancement, tasks persist in this browser's local storage. They are not synchronized across devices or tabs. Clearing browser data removes them. If storage is blocked or full, task management still works for the current session and the app displays a save notice. Stored data is checked before loading, so malformed records do not crash the app.

## Source structure

```text
src/
  App.jsx                    State, persistence, and task actions
  todos.js                   Reducer, ordering/filtering, storage helpers
  styles.css                 Prototype styling and responsive layout
  components/
    TodoInput.jsx            Unrestricted add form
    TodoList.jsx             Filters, task list, and empty state
    TodoItem.jsx             Pending/completed row and inline editing
    DeleteDialog.jsx         Accessible native confirmation dialog
tests/
  todos.test.js              State and storage unit tests
  e2e/todo.spec.js           Browser interaction tests
scripts/
  record-demo.mjs            Reproducible video walkthrough
```

React renders task descriptions as plain text, so HTML-like descriptions are never executed. Inputs and controls have accessible names, the filters expose their pressed state, and the delete dialog uses native modal focus handling.

## Tests

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

To use an installed Google Chrome instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

The 9 unit tests cover unrestricted descriptions, immutable completion, stable ordering, deletion, persistence, corrupted data, and storage failures. The 11 browser tests cover the complete interaction flow, all filters, cancel/confirm behavior, reload persistence, plain-text rendering, browser errors, and the mobile layout at 320px.

## Video walkthrough

To record a walkthrough of all features, start the app in one terminal with `npm run dev`. In another terminal:

```sh
npx playwright install chromium
npm run demo
```

The script writes a video and a prototype-style screenshot to `demo-recordings/`. It uses an isolated browser profile and does not change your saved tasks. You can set `DEMO_URL` to another local preview address, `DEMO_OUTPUT_DIR` to an output folder, and `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome. FFmpeg must be installed by Playwright for video recording (`npx playwright install ffmpeg`).

## References

- [Vite setup, scripts, and Node.js requirements](https://vite.dev/guide/)
- [React state and interactivity](https://react.dev/learn/adding-interactivity)

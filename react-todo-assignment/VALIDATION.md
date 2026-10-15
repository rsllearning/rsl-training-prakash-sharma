# Validation

Verified on 15 October 2026 using Node.js 24.19.0 and installed Google Chrome on Windows.

| Check | Result |
| --- | --- |
| `npm test` | 9 passed, 0 failed |
| `npm run test:e2e` with `PLAYWRIGHT_CHANNEL=chrome` | 11 passed, 0 failed |
| `npm run build` | Passed; production files generated in `dist/` |
| Local development page | HTTP 200 |
| Walkthrough video | 51.4 seconds, 1120 x 860; metadata and frame seeking verified in Chrome without playback errors |

Browser checks exercise add (including empty and arbitrary text), append order, edit prefill/cancel/confirm, Enter/Escape controls, completed-first ordering, permanent completion, strikethrough styling, deletion confirmation/cancellation, all filters and opacity 0.6, empty states, persistence after reload, corrupt/blocked storage, safe plain-text rendering, and a 320px viewport without horizontal overflow.

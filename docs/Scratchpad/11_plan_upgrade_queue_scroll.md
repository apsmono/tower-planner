# Plan
- [x] Read current DOM of http://localhost:5173/
- [x] Click on "Upgrade Queue" tab in sidebar (Element index 3)
- [x] Take a screenshot
- [x] Check if scroll issues or overflow exists

# Findings
- The "Upgrade Queue" page contains a long table of Research Rankings.
- When scrolling, the entire window/page scrolls, which pushes the sidebar navigation out of view.
- Pinned goals in the sidebar were initially pushed outside the viewport (at y=1083, viewport height is 1024) before scrolling.
- After scrolling down, the sidebar items ("Import & Runs", "Tier Lab") scrolled off-screen.
- This indicates a layout issue where the main content and sidebar are not independently scrollable, or the page container does not constrain the height to the viewport.



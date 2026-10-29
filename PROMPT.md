Build a maze game in THIS folder: C:\xampp\htdocs\maze

A recruiter-ready browser maze. Playable, polished, no backend.

## Game
- Call it "Neon Labyrinth". Original art, no licensed branding.
- Generate a perfect maze (recursive backtracker) on a 15×15 odd grid. Player starts at top-left, exit at bottom-right. Arrow keys / WASD / D-pad move one cell if the wall is open. R generates a new maze.
- Timer from first move. Reaching the exit is a win. Local best time in localStorage.

## UI
- Dark walls, glowing path, bright player and exit. Not a default Vite page. No Vue logo.
- 390px phone and 1280px desktop.

## Tests
- Vitest (pure logic): a generated maze has a start and an exit; a move into a wall is rejected; a move into an open cell updates the player; standing on the exit is a win.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/maze
- Pages: https://oscarmmi.github.io/maze/
- vite base `/maze/`
- Commit: feat: add maze
- First commit must `git add -A` so package.json, vite.config.ts, tsconfigs, src/main.ts, index.html, .gitignore, and .github/workflows/pages.yml ship with the game.
- gh repo edit --description "Neon Labyrinth maze in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic maze --add-topic puzzle
- Stop. Print the repo URL and Pages URL.

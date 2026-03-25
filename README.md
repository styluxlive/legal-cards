# Ckrit MaCard

Interactive card game by Jabulani Mdluli.

## Game Description

Ckrit MaCard is a 52-card interactive game with multiple modes: Practice (offline), Reality (online), and Corner (local network/Bluetooth).

### Features

- SVG-based card rendering
- Responsive design, mobile-first
- PWA support
- Multiple game modes
- Stats tracking
- Customizable shuffle intervals
- AI features for practice mode
- Monetization with Ckrit tokens
- eSports capabilities

### How to Play

1. Select a game mode.
2. In Practice mode, start dealing cards.
3. Challanger makes requests (Small Top/Bottom/Center, Request Card).
4. Dealer follows requests.
5. Check if requested card lands in DEAL or CHALLANGER area.

### Installation

Open `index.html` in a modern browser. For PWA, install from browser.

### Development

Built with vanilla JavaScript, no external libraries.

## Run Locally (Development)

1. Install dependencies:

```bash
npm install
```

2. Start the static server with WebSocket stub:

```bash
npm start
# then open http://localhost:3000 in your browser
```

3. Run deck smoke tests (no external test framework required):

```bash
npm run test
```

Notes:
- `server.js` serves the project directory and provides a minimal WebSocket endpoint for `Reality` mode stubs.
- If `npm install` is not possible in your environment, you can still open `index.html` directly in a browser for Practice mode.

If you'd like, I can run `npm install` and execute the smoke tests here; let me know to proceed.

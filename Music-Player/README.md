# 🎧 Music Player

A premium, fully responsive music player built with **pure HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no libraries.

## Features

- Glassmorphism UI with an animated gradient background
- Rotating album art that spins while playing and stops when paused
- Full playback controls: play/pause, previous, next, shuffle, repeat (off / all / one)
- Click-or-drag progress bar with seek, buffered indicator, current time & duration
- Volume slider, mute/unmute, and an autoplay toggle
- Playlist with search, Favorites tab, and Recently Played tab (saved to `localStorage`)
- Click a song to highlight it, auto-scroll it into view, and play it instantly
- Keyboard shortcuts:
  - `Space` — Play / Pause
  - `→` — Next song
  - `←` — Previous song (or restart current song if >3s in)
  - `↑` / `↓` — Volume up / down
- Bonus: loading animation, audio visualizer bars, toast notifications, custom scrollbar, mini player, mobile-first responsive layout

## Getting Started

1. This project already ships with **6 demo tracks** (short synthesized tones) in `assets/songs/` and **6 gradient cover images** in `assets/images/`, so it works out of the box.
2. To use your own music, replace the files in `assets/songs/` (`.mp3`) and `assets/images/` (`.jpg`/`.png`), then update the `songs` array at the top of `script.js` with the correct `title`, `artist`, `cover`, and `src` for each track.
3. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Project Structure

```
Music-Player/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── songs/     → audio files (.mp3)
    ├── images/    → album cover art
    └── icons/     → (optional) extra icon assets
```

## Browser Support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses `backdrop-filter`, CSS custom properties, and the HTML5 `<audio>` API.

Enjoy the music! 🎶

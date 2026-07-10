# 🖼️ Aperture — Image Gallery

A premium, fully responsive image gallery built with **pure HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no libraries.

## Features

- Glassmorphism header with sticky nav, search toggle, and dark/light theme switch
- Animated gradient hero with floating shapes and a call-to-action
- Category filter chips (All, Nature, Animals, Technology, Architecture, Food, Travel, Cars, People)
- Responsive CSS Grid gallery — 4 / 3 / 2 / 1 columns depending on screen size
- Hover zoom, overlay fade, and quick-action buttons (view, like, download) on every card
- Fullscreen lightbox with previous/next navigation, image counter, like & download, native fullscreen mode, and instant CSS image filters (Grayscale, B&W, Sepia, Blur, Brightness, Contrast, Invert)
- Keyboard support in the lightbox: `Esc` close, `←` previous, `→` next; click outside image also closes it
- Live search across title, category, and photographer, with a "No Images Found" empty state
- "Load More" pagination — starts at 12 images, reveals the rest with a smooth stagger animation
- Bonus: favorites saved to `localStorage`, animated statistics counters, scroll-to-top button, button ripple effect, lazy-loaded images, loading screen, custom scrollbar

## Getting Started

1. This project already ships with **24 demo images** (generated gradient placeholders) across 8 categories in `assets/images/`, so it works immediately.
2. To use your own photos, replace the files in `assets/images/`, then update the `rawImages` array near the top of `script.js` with the correct filename, category, and title for each entry (photographer names cycle automatically, or edit the `photographers` array too).
3. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Project Structure

```
Image-Gallery/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── images/    → gallery photos
    └── icons/     → (optional) extra icon assets
```

## Browser Support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses `backdrop-filter`, CSS Grid, CSS custom properties, `IntersectionObserver`, and the Fullscreen API.

Enjoy browsing! 📸

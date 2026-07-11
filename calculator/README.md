# Calculator

A simple, browser-based calculator built with HTML, CSS, and JavaScript that behaves just like a real physical/phone calculator — plus a delightful, mood-lifting visual skin.

## Files

```
calculator/
├── index.html   # markup / structure
├── style.css    # delightful candy-gradient styling
├── script.js    # calculator logic + keyboard support
└── README.md
```

## Running it

Just open `index.html` in any modern browser. No server, build step, or dependencies required.

## Features

- **All four arithmetic operations**: addition (+), subtraction (−), multiplication (×), division (÷)
- **Real-calculator behavior** — operations are evaluated immediately, left to right, the way a physical/phone calculator works (e.g. `2 + 3 × 4` gives `20`, not `14`)
- **AC / C toggle** — the clear button shows "AC" in a fresh state and switches to "C" once you start typing, clearing just the current entry while keeping your running total, exactly like a real calculator
- **Repeat "="** — pressing `=` again after a calculation repeats the last operation (e.g. `5 + 3 =` gives `8`, pressing `=` again gives `11`)
- **± (sign toggle)** and **%** (percent), with % working contextually — `50 + 10%` computes 10% of 50, not just `÷ 100`
- **Division-by-zero handling** — shown as `Error`, and the calculator recovers cleanly on the next keypress
- **Keyboard support**:
  - `0`–`9` → digits
  - `+` `-` `*` `/` → operators
  - `.` → decimal point
  - `Enter` or `=` → evaluate
  - `Backspace` → delete last digit
  - `Escape` → clear
  - `%` → percent

## Design

The interface uses a candy-sunrise color palette (blush pink, butter yellow, mint, lilac) with rounded "Fredoka" and "Quicksand" typefaces, meant to feel warm and playful rather than clinical. A few small touches make it feel alive:

- The calculator and its keys bounce into place in a quick staggered wave on page load
- Every key press has a satisfying "jelly squish" animation
- The `=` key pulses gently to invite you to press it
- Number and function keys tilt slightly on hover

The design respects `prefers-reduced-motion` for users who prefer fewer animations, and keeps visible focus outlines for keyboard accessibility.

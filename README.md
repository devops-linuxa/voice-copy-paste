# Voice Copy-Paste

**Voice-to-text dictation for Chrome with a persistent floating overlay.**

Voice Copy-Paste is a lightweight Chrome extension that lets you dictate speech and follow the recognized text in a floating overlay while continuing to work in another browser tab.

Unlike traditional voice-typing tools that depend on the active cursor or text field, Voice Copy-Paste keeps the transcription visible on the page, so you can browse, read documentation, or work in web applications while speaking.

## Features

- 🎙️ **Voice dictation** — convert speech into text using browser speech recognition.
- 🌍 **Russian and English** — designed for dictation in both languages.
- 🔴 **Persistent floating overlay** — view recognized text without switching back to the dictation tab.
- 📜 **Automatic scrolling** — the latest recognized text stays visible as the transcription grows.
- 🖥️ **Cross-tab workflow** — keep dictating while working on another webpage.
- 🌑 **Compact dark interface** — a minimal overlay with a recording indicator and readable text.
- ⌨️ **Keyboard shortcut** — press `Alt+C` to start or stop dictation.
- 🧩 **Lightweight implementation** — built with standard browser extension technologies.

## Why Voice Copy-Paste?

Many dictation tools focus on inserting speech directly into the currently focused text field. This can be inconvenient when switching tabs, moving the cursor, or reading information while speaking.

Voice Copy-Paste takes a different approach: it displays recognized speech in a floating overlay that is independent of cursor position. You can continue working on the original webpage while keeping the transcription visible.

The goal is simple: **speak, see the text, and keep working without interrupting your workflow.**

## How to Use

1. Install the extension in Chrome.
2. Press `Alt+C` to start dictation.
3. Speak in Russian or English.
4. Follow the recognized text in the floating overlay.
5. Press `Alt+C` again to stop dictation.

As the transcription grows, the overlay automatically scrolls to keep the latest text visible. Its height is limited to avoid covering too much of the webpage.

## Installation

### Load the Extension Locally

1. Clone or download this repository.
2. Open `chrome://extensions/` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the directory containing `manifest.json`.

The extension will appear in your Chrome extensions list.

## Technology Stack

- **JavaScript** — extension logic and message handling.
- **HTML and CSS** — popup and interface styling.
- **Chrome Extensions API (Manifest V3)** — browser integration, commands, tabs, and scripting.
- **Web Speech API** — speech recognition.
- **Shadow DOM** — isolates the overlay UI and its styles from the host webpage.

## Browser Compatibility

Voice Copy-Paste is designed for Google Chrome and Chromium-based browsers that support the required extension APIs and speech recognition functionality.

Speech recognition availability and behavior may vary depending on the browser, operating system, language, and recognition service.

## Project Status

Voice Copy-Paste is under development.

The current focus is on a simple, reliable dictation workflow with a persistent floating overlay, automatic scrolling, and minimal interruption to everyday browsing.

## Contributing

Suggestions, bug reports, and improvements are welcome. Feel free to open an issue or submit a pull request.

If you build on this project, sharing your improvements with the community is appreciated.

## Acknowledgements

Built to make voice dictation more convenient for everyday browsing, writing, and development.
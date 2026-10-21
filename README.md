# Calculator

A responsive dark calculator built with plain HTML, CSS, and JavaScript. It supports mouse/touch and keyboard input, operator precedence, decimals, negative values, percentages, clear, delete, and readable error messages. Arithmetic is parsed without `eval`.

## Run in VS Code

1. Open this folder in VS Code (`File → Open Folder…`).
2. Open `index.html` in a browser. For automatic reloads, install the **Live Server** extension, then right-click `index.html` and choose **Open with Live Server**.

No build step or dependencies are required.

## Keyboard

- `0`–`9`, `.`, `+`, `-`, `*`, `/`, `%`: enter a calculation
- `Enter` or `=`: calculate
- `Backspace`: delete the last character
- `Delete` or `Escape`: clear

## Deploy to GitHub Pages

1. Create a GitHub repository and push these files to its default branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.
4. Wait for the Pages deployment to finish. The site will be available at the URL shown in the Pages settings.

All paths are relative, so the site works from a GitHub Pages project subpath.

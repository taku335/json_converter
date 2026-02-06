# Repository Guidelines

## Project Structure & Module Organization
This repository is a small static web app. All source files live at the repo root:
- `index.html` contains the markup and form layout.
- `style.css` holds the global styles and responsive layout.
- `script.js` implements validation and JSON output logic.
There are no separate build or test directories, and no bundled assets.

## Build, Test, and Development Commands
There is no build step. Open `index.html` directly in a browser for quick checks. For a local server (recommended for consistent behavior), use:
- `python -m http.server 8000` to serve the site and avoid file URL quirks.
No automated test command exists in this repository.

## Coding Style & Naming Conventions
Keep formatting consistent with the existing files:
- Indentation uses 2 spaces in HTML, CSS, and JS.
- JavaScript uses `const`/`let`, semicolons, and double quotes.
- CSS class names are lowercase with hyphens (e.g., `content-split`).
- JavaScript identifiers are `camelCase` (e.g., `submitButton`).
If you introduce tooling (formatter/linter), document it here and in `README.md`.

## Testing Guidelines
There is no testing framework configured. Changes should be manually validated in the UI:
- Enter valid/invalid inputs and confirm inline errors.
- Verify JSON output formatting in the preview pane.
If you add tests, prefer a lightweight setup and document how to run them.

## Commit & Pull Request Guidelines
Use a strict Conventional Commits format:
- Format: `type(scope): summary` (scope is optional).
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Use present tense and keep summaries under 72 characters.
- Examples: `fix(validation): reject environment-dependent chars`, `docs: add contribution guide`.
Pull requests must:
- Address a single feature or fix (no mixed concerns).
- Include a brief summary, manual testing notes, and linked issue(s) when applicable.
- Add before/after screenshots for UI changes.
- Avoid WIP; the PR should be ready to merge.

## Configuration & Deployment Notes
This is a static site suitable for GitHub Pages. Avoid introducing server-only dependencies unless the project scope changes.

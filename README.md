# Yokoi

**Contributors:** iconick  
**Tags:** blocks, editor, gutenberg  
**Requires at least:** 6.0  
**Tested up to:** 6.4  
**Requires PHP:** 7.4  
**Stable tag:** 0.1.0  
**License:** GPLv2 or later  
**License URI:** https://www.gnu.org/licenses/gpl-2.0.html

Modular Gutenberg blocks with site-wide settings managed directly in the Site Editor.

## Description

Yokoi ships opinionated blocks backed by REST-powered settings, per-block asset loading, and a Site Editor sidebar for quickly enabling or disabling functionality across your site.

## Installation

1. Upload the plugin files to the `/wp-content/plugins/yokoi` directory, or install through the WordPress plugins screen.
2. Activate the plugin through the “Plugins” screen in WordPress.
3. Open the Site Editor and toggle blocks from the **Yokoi Settings** sidebar.

## Repository Layout

- `src/` – Editable JavaScript/SCSS sources for all blocks and the editor UI.
- `includes/` – Runtime PHP (render callbacks, REST plumbing, services).
- `scripts/` – Developer utilities (`npm run clean`, `npm run package`).
- `build/` – Generated assets (always re-created via `npm run build`).
- `dist/` – Final distributable created by `npm run package`.
- `tests/` – Development-only block discovery harness.
- `languages/` – Translation files.
- `vendor/` – Composer-installed PHP dependencies (optional in production if autoloading elsewhere).
- `yokoi.php` – Plugin bootstrap.

## Development

1. Install PHP dependencies:
   ```bash
   composer install
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development build:
   ```bash
   npm start
   ```
4. Rebuild production assets (automatically wipes `build/` first):
   ```bash
   npm run build
   ```
5. Produce a distributable bundle (outputs to `dist/`):
   ```bash
   npm run build:dist
   ```

### Coding Standards & QA

- PHP: WordPress Coding Standards via PHPCS (`vendor/bin/phpcs`)
- JavaScript/SCSS: `@wordpress/scripts` linting (`npm run lint:js`, `npm run lint:css`)
- Block discovery regression harness: `npm run test`
- Release hygiene: `npm run clean` removes `build/` and `dist/` so you start from a pristine state before rebuilding

## Changelog

### 0.1.0
* Initial release.

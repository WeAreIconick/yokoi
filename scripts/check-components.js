#!/usr/bin/env node
/**
 * Prevent importing Gutenberg components that are not shipped in the
 * production bundle available inside the WordPress editor.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const BANNED_COMPONENTS = new Set([
	'Card',
	'CardBody',
	'Heading',
	'__experimentalHStack',
	'__experimentalVStack',
]);

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const violations = [];

/**
 * Recursively iterate over files in a directory.
 *
 * @param {string} dir directory path
 */
function walk(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			walk(fullPath);
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name);

			if (EXTENSIONS.has(ext)) {
				checkFile(fullPath);
			}
		}
	}
}

/**
 * Inspect file content for banned imports.
 *
 * @param {string} filePath absolute file path
 */
function checkFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');

	if (!content.includes("@wordpress/components")) {
		return;
	}

	const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@wordpress\/components['"]/g;
	let match;

	while ((match = importRegex.exec(content)) !== null) {
		const imported = match[1]
			.split(',')
			.map((token) => token.trim().split(/\s+as\s+/i)[0]);

		for (const name of imported) {
			if (BANNED_COMPONENTS.has(name)) {
				violations.push({ filePath, component: name });
			}
		}
	}

	const defaultImportRegex = /import\s+([A-Za-z0-9_$]+)\s+from\s+['"]@wordpress\/components['"]/g;
	while ((match = defaultImportRegex.exec(content)) !== null) {
		const defaultName = match[1];
		if (BANNED_COMPONENTS.has(defaultName)) {
			violations.push({ filePath, component: defaultName });
		}
	}
}

if (fs.existsSync(SRC_DIR)) {
	walk(SRC_DIR);
}

if (violations.length > 0) {
	console.error(
		'\nUnsupported Gutenberg components detected in @wordpress/components imports:'
	);
	for (const violation of violations) {
		const relativePath = path.relative(ROOT, violation.filePath);
		console.error(`  - ${relativePath}: ${violation.component}`);
	}
	console.error(
		'\nThese components are not available in the production Site Editor bundle and cause runtime failures.'
	);
	process.exit(1);
}


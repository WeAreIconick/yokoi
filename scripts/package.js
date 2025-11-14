#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

const entriesToCopy = [
	'yokoi.php',
	'build',
	'includes',
	'languages',
	'readme.txt',
	'uninstall.php'
];

async function copyRecursive(source, destination) {
	const stats = await fs.stat(source);

	if (stats.isDirectory()) {
		await fs.mkdir(destination, { recursive: true });
		const items = await fs.readdir(source);

		for (const item of items) {
			await copyRecursive(
				path.join(source, item),
				path.join(destination, item)
			);
		}

		return;
	}

	await fs.copyFile(source, destination);
}

(async () => {
	await fs.rm(distDir, { recursive: true, force: true });
	await fs.mkdir(distDir, { recursive: true });

	for (const entry of entriesToCopy) {
		const sourcePath = path.join(root, entry);
		const destinationPath = path.join(distDir, entry);

		try {
			await fs.access(sourcePath);
			await copyRecursive(sourcePath, destinationPath);
		} catch (error) {
			// Skip missing directories, but warn for unexpected errors.
			if (error.code !== 'ENOENT') {
				console.warn(`Yokoi packaging: unable to copy ${entry}:`, error.message);
			}
		}
	}

	console.log('Yokoi package created in dist/');
})();


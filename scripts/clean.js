#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targets = [ 'build', 'dist' ];

async function removeDirectory(dir) {
	const target = path.join(root, dir);

	await fs.rm(target, { recursive: true, force: true });
}

(async () => {
	await Promise.all(targets.map(removeDirectory));
})();


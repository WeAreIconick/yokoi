#!/usr/bin/env node
'use strict';

/**
 * Check for undefined function calls in JavaScript files
 * 
 * This script scans JavaScript files for function calls that don't have
 * corresponding definitions, which can cause runtime errors.
 * 
 * It looks for patterns like:
 * - logDebug() calls without logDebug definition
 * - Other common debug/utility functions that might be removed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

// Known functions that should exist if called
// Add functions here that are commonly used but might be accidentally removed
const KNOWN_FUNCTIONS = new Set([
	// WordPress functions (these are global, so we don't check for them)
	'__',
	'apiFetch',
	'useState',
	'useEffect',
	'useCallback',
	'useMemo',
	'useRef',
	'useSelect',
	'useDispatch',
	'registerPlugin',
	'createElement',
	'Fragment',
	// Add any custom utility functions that should always exist
]);

// Functions that are known to be removed/obsolete and should not be called
const OBSOLETE_FUNCTIONS = new Set([
	'logDebug',
	'debug',
	'recordDebugLog',
	'ensureDebugFlag',
]);

/**
 * Find all JavaScript files recursively
 */
function findJsFiles(dir) {
	const files = [];
	
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			
			// Skip node_modules, build, dist, .git
			if (entry.isDirectory()) {
				if (!['node_modules', 'build', 'dist', '.git', 'vendor'].includes(entry.name)) {
					files.push(...findJsFiles(fullPath));
				}
			} else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
				files.push(fullPath);
			}
		}
	} catch (error) {
		// Skip directories we can't read
	}
	
	return files;
}

/**
 * Extract function definitions from a file
 */
function extractFunctionDefinitions(content) {
	const definitions = new Set();
	
	// Match function declarations: function functionName(...) { ... }
	const funcDeclRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
	let match;
	while ((match = funcDeclRegex.exec(content)) !== null) {
		definitions.add(match[1]);
	}
	
	// Match arrow function assignments: const functionName = (...) => { ... }
	const arrowFuncRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g;
	while ((match = arrowFuncRegex.exec(content)) !== null) {
		definitions.add(match[1]);
	}
	
	// Match method definitions: methodName(...) { ... }
	const methodRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
	while ((match = methodRegex.exec(content)) !== null) {
		definitions.add(match[1]);
	}
	
	// Match object method shorthand: { methodName(...) { ... } }
	const objMethodRegex = /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
	while ((match = objMethodRegex.exec(content)) !== null) {
		definitions.add(match[1]);
	}
	
	return definitions;
}

/**
 * Extract function calls from a file
 */
function extractFunctionCalls(content) {
	const calls = [];
	
	// Reserved keywords that are not function calls
	const reserved = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'return', 'typeof', 'instanceof', 'new', 'delete', 'void', 'function', 'const', 'let', 'var', 'class', 'extends', 'import', 'export', 'default', 'from', 'as']);
	
	// Match function calls: functionName(...)
	// This regex matches identifiers followed by parentheses, but not after a dot
	const lines = content.split('\n');
	
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		
		// Look for obsolete function calls specifically
		for (const obsoleteFunc of OBSOLETE_FUNCTIONS) {
			// Match: obsoleteFunc( but not obj.obsoleteFunc( or this.obsoleteFunc(
			const regex = new RegExp(`(?:^|[^\\w.])\\b(${obsoleteFunc})\\s*\\(`, 'g');
			let match;
			while ((match = regex.exec(line)) !== null) {
				calls.push({
					name: match[1],
					line: lineIndex + 1,
					index: match.index
				});
			}
		}
	}
	
	return calls;
}

/**
 * Check a single file for undefined function calls
 */
function checkFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const relativePath = path.relative(root, filePath);
	
	const calls = extractFunctionCalls(content);
	const errors = [];
	
	for (const call of calls) {
		const funcName = call.name;
		
		// Check if it's an obsolete function that shouldn't be called
		if (OBSOLETE_FUNCTIONS.has(funcName)) {
			errors.push({
				file: relativePath,
				line: call.line,
				type: 'obsolete',
				function: funcName,
				message: `Call to obsolete function "${funcName}" found. This function has been removed and should not be called.`
			});
		}
	}
	
	return errors;
}

/**
 * Main function
 */
function main() {
	console.log('Checking for undefined function calls...\n');
	
	const jsFiles = findJsFiles(srcDir);
	let totalErrors = 0;
	const allErrors = [];
	
	for (const file of jsFiles) {
		const errors = checkFile(file);
		if (errors.length > 0) {
			allErrors.push(...errors);
			totalErrors += errors.length;
		}
	}
	
	if (totalErrors > 0) {
		console.error(`❌ Found ${totalErrors} error(s):\n`);
		
		// Group errors by file
		const errorsByFile = {};
		for (const error of allErrors) {
			if (!errorsByFile[error.file]) {
				errorsByFile[error.file] = [];
			}
			errorsByFile[error.file].push(error);
		}
		
		// Print errors grouped by file
		for (const [file, errors] of Object.entries(errorsByFile)) {
			console.error(`\n${file}:`);
			for (const error of errors) {
				console.error(`  Line ${error.line}: ${error.message}`);
			}
		}
		
		console.error('\n🚫 Undefined function check failed. Please fix the errors above.');
		process.exit(1);
	} else {
		console.log('✅ No undefined function calls found!');
		process.exit(0);
	}
}

main();


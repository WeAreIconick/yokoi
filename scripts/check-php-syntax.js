#!/usr/bin/env node

/**
 * PHP Syntax Checker
 * 
 * Validates PHP syntax in all PHP files before build to prevent critical errors.
 * This prevents PHP parse errors from reaching production.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { execSync } = require( 'child_process' );

/**
 * Find all PHP files in a directory
 */
function findPHPFiles( dir, fileList = [] ) {
	if ( ! fs.existsSync( dir ) ) {
		return fileList;
	}

	const files = fs.readdirSync( dir );
	
	files.forEach( ( file ) => {
		const filePath = path.join( dir, file );
		
		try {
			const stat = fs.statSync( filePath );
			
			if ( stat.isDirectory() ) {
				// Skip node_modules, build, dist, vendor, and .git directories
				if ( ! [ 'node_modules', 'build', 'dist', 'vendor', '.git', 'node_modules' ].includes( file ) ) {
					findPHPFiles( filePath, fileList );
				}
			} else if ( file.endsWith( '.php' ) ) {
				fileList.push( filePath );
			}
		} catch ( error ) {
			// Skip files we can't access
			if ( error.code !== 'ENOENT' ) {
				console.warn( `Warning: Could not access ${ filePath }: ${ error.message }` );
			}
		}
	} );
	
	return fileList;
}

/**
 * Check PHP syntax for a single file
 */
function checkPHPSyntax( filePath ) {
	try {
		// Use php -l to check syntax
		const result = execSync( `php -l "${ filePath }"`, { 
			encoding: 'utf8',
			stdio: [ 'pipe', 'pipe', 'pipe' ]
		} );
		
		return { valid: true, error: null };
	} catch ( error ) {
		// Extract error message from stderr
		const errorOutput = error.stderr ? error.stderr.toString() : error.message;
		return { valid: false, error: errorOutput };
	}
}

/**
 * Main function
 */
function main() {
	const rootDir = path.join( __dirname, '..' );
	const srcDir = path.join( rootDir, 'src' );
	const includesDir = path.join( rootDir, 'includes' );
	
	// Check PHP files in src and includes directories
	const files = [
		...findPHPFiles( srcDir ),
		...findPHPFiles( includesDir ),
	];
	
	// Also check root PHP files
	const rootFiles = [ 'yokoi.php', 'uninstall.php' ];
	rootFiles.forEach( ( file ) => {
		const filePath = path.join( rootDir, file );
		if ( fs.existsSync( filePath ) ) {
			files.push( filePath );
		}
	} );
	
	if ( files.length === 0 ) {
		console.log( '✅ No PHP files found to check.' );
		process.exit( 0 );
	}
	
	let hasErrors = false;
	const errors = [];
	
	console.log( `Checking ${ files.length } PHP file(s)...\n` );
	
	files.forEach( ( file ) => {
		const { valid, error } = checkPHPSyntax( file );
		
		if ( ! valid ) {
			hasErrors = true;
			const relativePath = path.relative( rootDir, file );
			errors.push( {
				file: relativePath,
				error: error.trim(),
			} );
		}
	} );
	
	if ( hasErrors ) {
		console.error( '\n❌ PHP syntax errors detected:\n' );
		
		errors.forEach( ( { file, error } ) => {
			console.error( `  ${ file }:` );
			console.error( `    ${ error.split( '\n' ).join( '\n    ' ) }` );
			console.error( '' );
		} );
		
		console.error( '💡 Fix these errors before building.\n' );
		process.exit( 1 );
	} else {
		console.log( '✅ All PHP files have valid syntax!' );
		process.exit( 0 );
	}
}

if ( require.main === module ) {
	main();
}

module.exports = { checkPHPSyntax, findPHPFiles };


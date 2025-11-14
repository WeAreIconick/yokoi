#!/usr/bin/env node

/**
 * Import Checker
 * 
 * Checks that all React components and WordPress components used in JSX
 * are properly imported. This prevents runtime errors from missing imports.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { execSync } = require( 'child_process' );

// Common WordPress components that should be imported
const WORDPRESS_COMPONENTS = [
	'Button',
	'ButtonGroup',
	'Card',
	'CardBody',
	'CheckboxControl',
	'ColorPalette',
	'Flex',
	'FlexItem',
	'Notice',
	'PanelBody',
	'Placeholder',
	'RangeControl',
	'SearchControl',
	'SelectControl',
	'Spinner',
	'TabPanel',
	'TextControl',
	'TextareaControl',
	'ToggleControl',
	'ToolbarButton',
	'ToolbarGroup',
	'BaseControl',
	'ExternalLink',
];

// Common WordPress icons
const WORDPRESS_ICONS = [
	'starEmpty',
	'starFilled',
	'undo',
	'redo',
	'plus',
	'trash',
	'arrowLeft',
	'arrowRight',
	'upload',
	'external',
	'formatUppercase',
	'formatBold',
];

// Common React/WordPress hooks
const HOOKS = [
	'useState',
	'useEffect',
	'useCallback',
	'useRef',
	'useMemo',
	'useDispatch',
	'useSelect',
];

/**
 * Extract JSX component names from a file
 */
function extractJSXComponents( content ) {
	const components = new Set();
	
	// Match JSX elements: <ComponentName or <ComponentName.
	const jsxRegex = /<([A-Z][a-zA-Z0-9]*)/g;
	let match;
	
	while ( ( match = jsxRegex.exec( content ) ) !== null ) {
		const componentName = match[1];
		// Skip HTML elements (lowercase)
		if ( componentName[0] === componentName[0].toUpperCase() ) {
			components.add( componentName );
		}
	}
	
	return components;
}

/**
 * Extract imported names from import statements
 */
function extractImports( content ) {
	const imports = new Set();
	
	// Match import statements
	const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+['"]([^'"]+)['"]|(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"])/g;
	
	// Match named imports: import { Component1, Component2 } from '...'
	const namedImportRegex = /\{([^}]+)\}/g;
	
	let match;
	while ( ( match = importRegex.exec( content ) ) !== null ) {
		const importStatement = match[0];
		const namedMatch = namedImportRegex.exec( importStatement );
		
		if ( namedMatch ) {
			// Extract individual imports
			const importsList = namedMatch[1]
				.split( ',' )
				.map( ( imp ) => imp.trim().split( ' as ' )[0].trim() );
			
			importsList.forEach( ( imp ) => imports.add( imp ) );
		} else {
			// Default import: import Component from '...'
			const defaultMatch = importStatement.match( /import\s+(\w+)\s+from/ );
			if ( defaultMatch ) {
				imports.add( defaultMatch[1] );
			}
		}
	}
	
	return imports;
}

/**
 * Check a single file for missing imports
 */
function checkFile( filePath ) {
	const content = fs.readFileSync( filePath, 'utf8' );
	const jsxComponents = extractJSXComponents( content );
	const imports = extractImports( content );
	
	const missing = [];
	
	// Extract local component definitions (const ComponentName = ... or function ComponentName)
	const localComponents = new Set();
	const assignedVariables = new Set();
	
	// Match: const ComponentName = ... or function ComponentName(...) or export default function ComponentName
	const localComponentRegex = /(?:const|function|export\s+(?:default\s+)?function|export\s+default\s+function)\s+([A-Z][a-zA-Z0-9]*)\s*[=\(]/g;
	let match;
	while ( ( match = localComponentRegex.exec( content ) ) !== null ) {
		localComponents.add( match[1] );
	}
	
	// Match: export const ComponentName = ... or export function ComponentName
	const exportRegex = /export\s+(?:default\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/g;
	while ( ( match = exportRegex.exec( content ) ) !== null ) {
		localComponents.add( match[1] );
	}
	
	// Match: let ComponentName = null or var ComponentName = ... (variables that get assigned later)
	const variableRegex = /(?:let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=/g;
	while ( ( match = variableRegex.exec( content ) ) !== null ) {
		assignedVariables.add( match[1] );
	}
	
	// Match: ComponentName = ... (assignment to existing variable)
	const assignmentRegex = /^\s*([A-Z][a-zA-Z0-9]*)\s*=/gm;
	while ( ( match = assignmentRegex.exec( content ) ) !== null ) {
		assignedVariables.add( match[1] );
	}
	
	// Check each JSX component
	for ( const component of jsxComponents ) {
		// Skip React built-ins
		if ( component === 'Fragment' || component === 'React' ) {
			continue;
		}
		
		// Skip local components (defined in the same file)
		if ( localComponents.has( component ) ) {
			continue;
		}
		
		// Skip variables that are assigned dynamically (like SitePluginSidebar = PluginSidebar)
		if ( assignedVariables.has( component ) ) {
			continue;
		}
		
		// Check if it's imported
		if ( ! imports.has( component ) ) {
			// Check if it might be a destructured import we missed
			// Look for import statements more carefully
			const importPatterns = [
				new RegExp( `import\\s+.*\\{[^}]*\\b${ component }\\b[^}]*\\}.*from`, 'g' ),
				new RegExp( `import\\s+${ component }\\s+from`, 'g' ),
			];
			
			const hasImport = importPatterns.some( ( pattern ) => pattern.test( content ) );
			
			// Also check if it's assigned from another variable (like PluginSidebar from a package)
			const assignmentPattern = new RegExp( `${ component }\\s*=\\s*[A-Z]`, 'g' );
			const isAssigned = assignmentPattern.test( content );
			
			if ( ! hasImport && ! isAssigned ) {
				missing.push( component );
			}
		}
	}
	
	return missing;
}

/**
 * Find all JavaScript/JSX files
 */
function findJSFiles( dir, fileList = [] ) {
	const files = fs.readdirSync( dir );
	
	files.forEach( ( file ) => {
		const filePath = path.join( dir, file );
		const stat = fs.statSync( filePath );
		
		if ( stat.isDirectory() ) {
			// Skip node_modules and build directories
			if ( ! [ 'node_modules', 'build', 'dist', '.git' ].includes( file ) ) {
				findJSFiles( filePath, fileList );
			}
		} else if ( file.endsWith( '.js' ) || file.endsWith( '.jsx' ) ) {
			fileList.push( filePath );
		}
	} );
	
	return fileList;
}

/**
 * Main function
 */
function main() {
	const srcDir = path.join( __dirname, '..', 'src' );
	const files = findJSFiles( srcDir );
	
	let hasErrors = false;
	const errors = [];
	
	files.forEach( ( file ) => {
		const missing = checkFile( file );
		
		if ( missing.length > 0 ) {
			hasErrors = true;
			const relativePath = path.relative( process.cwd(), file );
			errors.push( {
				file: relativePath,
				missing,
			} );
		}
	} );
	
	if ( hasErrors ) {
		console.error( '\n❌ Missing imports detected:\n' );
		
		errors.forEach( ( { file, missing } ) => {
			console.error( `  ${ file }:` );
			missing.forEach( ( component ) => {
				console.error( `    - ${ component }` );
			} );
		} );
		
		console.error( '\n💡 Tip: Make sure to import all components used in JSX.\n' );
		process.exit( 1 );
	} else {
		console.log( '✅ All imports are present!' );
		process.exit( 0 );
	}
}

if ( require.main === module ) {
	main();
}

module.exports = { checkFile, extractJSXComponents, extractImports };


/**
 * Block isolation utilities for JavaScript.
 * Ensures blocks don't interfere with each other.
 *
 * @package Yokoi
 */

/**
 * Create an isolated namespace for a block.
 *
 * @param {string} blockName Block name (e.g., "yokoi/navygator").
 * @param {Object} config Configuration object.
 * @return {Object} Isolated namespace object.
 */
export function createBlockNamespace( blockName, config = {} ) {
	const blockSlug = blockName.split( '/' )[ 1 ] || blockName;
	const namespace = `Yokoi${ slugToClassName( blockSlug ) }`;
	const globalKey = `${ blockSlug }Initialized`;

	// Prevent duplicate initialization.
	if ( window[ globalKey ] ) {
		return null;
	}

	window[ globalKey ] = true;

	// Create isolated namespace.
	const isolated = {
		namespace,
		blockName,
		blockSlug,
		globalKey,
		config: {
			...config,
		},
		/**
		 * Scoped query selector.
		 *
		 * @param {string} selector CSS selector.
		 * @param {Element} context Context element (default: document).
		 * @return {Element|null}
		 */
		querySelector( selector, context = document ) {
			return context.querySelector( selector );
		},
		/**
		 * Scoped query selector all.
		 *
		 * @param {string} selector CSS selector.
		 * @param {Element} context Context element (default: document).
		 * @return {NodeList}
		 */
		querySelectorAll( selector, context = document ) {
			return context.querySelectorAll( selector );
		},
		/**
		 * Add scoped event listener.
		 *
		 * @param {Element|Window|Document} target Target element.
		 * @param {string} event Event name.
		 * @param {Function} handler Event handler.
		 * @param {Object} options Event options.
		 * @return {Function} Cleanup function.
		 */
		addEventListener( target, event, handler, options = {} ) {
			target.addEventListener( event, handler, options );
			return () => {
				target.removeEventListener( event, handler, options );
			};
		},
		/**
		 * Log debug message (no-op).
		 *
		 * @param {string} message Message to log.
		 * @param {*} data Additional data.
		 */
		log( message, data = null ) {
			// Silent - no logging
		},
		/**
		 * Log warning message (no-op).
		 *
		 * @param {string} message Message to log.
		 * @param {*} data Additional data.
		 */
		warn( message, data = null ) {
			// Silent - no logging
		},
		/**
		 * Log error message (no-op).
		 *
		 * @param {string} message Message to log.
		 * @param {Error} error Error object.
		 */
		error( message, error = null ) {
			// Silent - no logging
		},
	};

	return isolated;
}

/**
 * Create scoped CSS class name.
 *
 * @param {string} blockName Block name.
 * @param {string} className Base class name.
 * @return {string} Scoped class name.
 */
export function scopedClassName( blockName, className ) {
	const blockSlug = blockName.split( '/' )[ 1 ] || blockName;
	return `${ blockSlug }-${ className }`;
}

/**
 * Convert slug to class name.
 *
 * @param {string} slug Block slug (e.g., "navygator").
 * @return {string} Class name (e.g., "Navygator").
 */
function slugToClassName( slug ) {
	return slug
		.split( '-' )
		.map( ( part ) => part.charAt( 0 ).toUpperCase() + part.slice( 1 ) )
		.join( '' );
}

/**
 * Wrap block initialization in IIFE with isolation.
 *
 * @param {string} blockName Block name.
 * @param {Function} initFn Initialization function.
 * @param {Object} config Configuration object.
 */
export function isolatedBlockInit( blockName, initFn, config = {} ) {
	( function() {
		'use strict';

		const isolated = createBlockNamespace( blockName, config );

		if ( ! isolated ) {
			return; // Already initialized.
		}

		// Wrap initialization in error boundary.
		const safeInit = function( ...args ) {
			try {
				return initFn.apply( this, args );
			} catch ( error ) {
				isolated.error( 'Initialization failed', error );
				
				// Dispatch error event for monitoring.
				if ( typeof window !== 'undefined' && window.dispatchEvent ) {
					window.dispatchEvent(
						new CustomEvent( 'yokoi:block-error', {
							detail: {
								block: blockName,
								error: error.message,
								stack: error.stack,
								timestamp: new Date().toISOString(),
							},
						} )
					);
				}
				
				return null;
			}
		};

		// Wait for DOM to be ready.
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', () => {
				safeInit( isolated );
			} );
		} else {
			safeInit( isolated );
		}
	} )();
}


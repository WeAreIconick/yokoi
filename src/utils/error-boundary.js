/**
 * Error boundary utilities for block isolation.
 * Prevents errors in one block from affecting others.
 *
 * @package Yokoi
 */

/**
 * Wrap a function in an error boundary.
 *
 * @param {Function} fn Function to wrap.
 * @param {string} blockName Block name for error reporting.
 * @param {Function} onError Error handler (optional).
 * @return {Function} Wrapped function.
 */
export function withErrorBoundary( fn, blockName, onError = null ) {
	return function( ...args ) {
		try {
			return fn.apply( this, args );
		} catch ( error ) {
			const errorInfo = {
				block: blockName,
				error: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString(),
			};

			// Log error with block context.
			console.error( `[Yokoi Block Error] ${ blockName }:`, errorInfo );

			// Call custom error handler if provided.
			if ( onError ) {
				onError( error, errorInfo );
			}

			// Dispatch error event for monitoring.
			if ( typeof window !== 'undefined' && window.dispatchEvent ) {
				window.dispatchEvent(
					new CustomEvent( 'yokoi:block-error', {
						detail: errorInfo,
					} )
				);
			}

			// Return null to prevent further execution.
			return null;
		}
	};
}

/**
 * Create an async error boundary.
 *
 * @param {Function} fn Async function to wrap.
 * @param {string} blockName Block name for error reporting.
 * @param {Function} onError Error handler (optional).
 * @return {Function} Wrapped async function.
 */
export function withAsyncErrorBoundary( fn, blockName, onError = null ) {
	return async function( ...args ) {
		try {
			return await fn.apply( this, args );
		} catch ( error ) {
			const errorInfo = {
				block: blockName,
				error: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString(),
			};

			console.error( `[Yokoi Block Error] ${ blockName }:`, errorInfo );

			if ( onError ) {
				onError( error, errorInfo );
			}

			if ( typeof window !== 'undefined' && window.dispatchEvent ) {
				window.dispatchEvent(
					new CustomEvent( 'yokoi:block-error', {
						detail: errorInfo,
					} )
				);
			}

			return null;
		}
	};
}

/**
 * Wrap event listener with error boundary.
 *
 * @param {Function} handler Event handler.
 * @param {string} blockName Block name.
 * @return {Function} Wrapped handler.
 */
export function safeEventListener( handler, blockName ) {
	return withErrorBoundary( handler, blockName, ( error ) => {
		// Prevent error from bubbling up.
		error.stopPropagation?.();
		error.preventDefault?.();
	} );
}

/**
 * Execute code in isolated context.
 *
 * @param {Function} fn Function to execute.
 * @param {string} blockName Block name.
 * @param {Object} context Context object.
 * @return {*} Function result or null on error.
 */
export function executeInIsolation( fn, blockName, context = {} ) {
	const isolatedContext = {
		...context,
		blockName,
		timestamp: Date.now(),
	};

	return withErrorBoundary(
		() => fn( isolatedContext ),
		blockName
	)();
}


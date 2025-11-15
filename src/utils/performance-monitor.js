/**
 * Performance monitoring utilities for blocks.
 *
 * @package Yokoi
 */

/**
 * Create a performance marker.
 *
 * @param {string} blockName Block name.
 * @param {string} markerName Marker name.
 */
export function markPerformance( blockName, markerName ) {
	if ( typeof performance !== 'undefined' && performance.mark ) {
		const marker = `yokoi-${ blockName }-${ markerName }`;
		performance.mark( marker );
	}
}

/**
 * Measure performance between two markers.
 *
 * @param {string} blockName Block name.
 * @param {string} measureName Measure name.
 * @param {string} startMarker Start marker name.
 * @param {string} endMarker End marker name.
 * @return {number|null} Duration in milliseconds or null.
 */
export function measurePerformance( blockName, measureName, startMarker, endMarker ) {
	if ( typeof performance === 'undefined' || ! performance.measure ) {
		return null;
	}

	const measure = `yokoi-${ blockName }-${ measureName }`;
	const start = `yokoi-${ blockName }-${ startMarker }`;
	const end = `yokoi-${ blockName }-${ endMarker }`;

	try {
		performance.measure( measure, start, end );
		const entries = performance.getEntriesByName( measure );
		
		if ( entries.length > 0 ) {
			return entries[ entries.length - 1 ].duration;
		}
	} catch ( e ) {
		// Marker doesn't exist or other error.
		return null;
	}

	return null;
}

/**
 * Track memory usage for a block.
 *
 * @param {string} blockName Block name.
 * @return {Object|null} Memory usage object or null.
 */
export function trackMemory( blockName ) {
	if ( typeof performance === 'undefined' || ! performance.memory ) {
		return null;
	}

	return {
		block: blockName,
		used: performance.memory.usedJSHeapSize,
		total: performance.memory.totalJSHeapSize,
		limit: performance.memory.jsHeapSizeLimit,
		timestamp: Date.now(),
	};
}

/**
 * Monitor function execution time.
 *
 * @param {Function} fn Function to monitor.
 * @param {string} blockName Block name.
 * @param {string} operationName Operation name.
 * @return {Function} Wrapped function.
 */
export function monitorExecution( fn, blockName, operationName ) {
	return function( ...args ) {
		const start = performance.now();
		const startMarker = `${ operationName }-start`;
		
		markPerformance( blockName, startMarker );

		try {
			const result = fn.apply( this, args );
			
			// Handle async functions.
			if ( result instanceof Promise ) {
				return result.finally( () => {
					const endMarker = `${ operationName }-end`;
					markPerformance( blockName, endMarker );
					const duration = measurePerformance(
						blockName,
						operationName,
						startMarker,
						endMarker
					);
					
					// Silent - no logging
				} );
			}

			const endMarker = `${ operationName }-end`;
			markPerformance( blockName, endMarker );
			const duration = performance.now() - start;

			// Silent - no logging

			return result;
		} catch ( error ) {
			const endMarker = `${ operationName }-end`;
			markPerformance( blockName, endMarker );
			throw error;
		}
	};
}


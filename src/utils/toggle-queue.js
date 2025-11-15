/**
 * Toggle Queue Manager
 * 
 * Handles rapid toggles by queuing updates and processing them in batches.
 * Ensures all toggles are processed correctly even when happening rapidly.
 */

/**
 * Queue-based toggle manager
 */
export class ToggleQueue {
	constructor( options = {} ) {
		this.queue = new Map();
		this.processing = false;
		this.debounceDelay = options.debounceDelay || 300;
		this.maxBatchSize = options.maxBatchSize || 50;
		this.timeoutId = null;
		this.processCallback = null;
		this.onComplete = null;
	}

	/**
	 * Set the callback to process queued updates
	 */
	setProcessCallback( callback ) {
		this.processCallback = callback;
	}

	/**
	 * Set callback for when processing completes
	 */
	setOnComplete( callback ) {
		this.onComplete = callback;
	}

	/**
	 * Add a toggle to the queue
	 */
	enqueue( blockName, enabled ) {
		// Update or add to queue
		this.queue.set( blockName, enabled );

		// Clear existing timeout
		if ( this.timeoutId ) {
			clearTimeout( this.timeoutId );
		}

		// Process immediately if queue is getting large
		if ( this.queue.size >= this.maxBatchSize ) {
			this.process();
			return;
		}

		// Otherwise, debounce
		this.timeoutId = setTimeout( () => {
			this.process();
		}, this.debounceDelay );
	}

	/**
	 * Process all queued updates
	 */
	async process() {
		if ( this.processing || this.queue.size === 0 ) {
			return;
		}

		// Clear timeout if it exists
		if ( this.timeoutId ) {
			clearTimeout( this.timeoutId );
			this.timeoutId = null;
		}

		this.processing = true;

		try {
			// Get all queued updates
			const updates = new Map( this.queue );
			
			// Clear the queue
			this.queue.clear();

			// Convert to object format
			const updatesObject = {};
			updates.forEach( ( enabled, blockName ) => {
				updatesObject[ blockName ] = enabled;
			} );

			// Process updates via callback
			if ( this.processCallback ) {
				await this.processCallback( updatesObject );
			}

			// Call completion callback
			if ( this.onComplete ) {
				this.onComplete( updatesObject );
			}
		} catch ( error ) {
			// Silent error handling
		} finally {
			this.processing = false;

			// Process any updates that came in while we were processing
			if ( this.queue.size > 0 ) {
				this.timeoutId = setTimeout( () => {
					this.process();
				}, this.debounceDelay );
			}
		}
	}

	/**
	 * Get current queue size
	 */
	getQueueSize() {
		return this.queue.size;
	}

	/**
	 * Check if processing
	 */
	isProcessing() {
		return this.processing;
	}

	/**
	 * Clear the queue
	 */
	clear() {
		if ( this.timeoutId ) {
			clearTimeout( this.timeoutId );
			this.timeoutId = null;
		}
		this.queue.clear();
		this.processing = false;
	}

	/**
	 * Get pending updates as object
	 */
	getPendingUpdates() {
		const updates = {};
		this.queue.forEach( ( enabled, blockName ) => {
			updates[ blockName ] = enabled;
		} );
		return updates;
	}
}


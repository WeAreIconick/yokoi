/**
 * Block Registry Manager
 * 
 * Dynamically unregisters and re-registers blocks based on settings.
 * All blocks must be registered server-side first, then we can safely
 * unregister/re-register them client-side.
 */

import { unregisterBlockType, registerBlockType, getBlockType } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';

// Track which blocks we've unregistered and their full metadata
const UNREGISTERED_BLOCKS = new Map();
const BLOCK_METADATA_CACHE = new Map();

/**
 * Get disabled blocks from settings
 */
export function getDisabledBlocks( settings ) {
	if ( ! settings || ! settings.blocks_enabled ) {
		return [];
	}

	return Object.entries( settings.blocks_enabled )
		.filter( ( [ , enabled ] ) => ! enabled )
		.map( ( [ name ] ) => name );
}

/**
 * Get enabled blocks from settings
 */
export function getEnabledBlocks( settings ) {
	if ( ! settings || ! settings.blocks_enabled ) {
		return [];
	}

	return Object.entries( settings.blocks_enabled )
		.filter( ( [ , enabled ] ) => enabled )
		.map( ( [ name ] ) => name );
}

/**
 * Unregister disabled blocks and cache their full metadata
 */
function unregisterDisabledBlocks( settings ) {
	if ( ! window?.wp?.blocks ) {
		return;
	}

	const { unregisterBlockType: unregister, getBlockType: getType } = window.wp.blocks;
	const disabledBlocks = getDisabledBlocks( settings );

	disabledBlocks.forEach( ( blockName ) => {
		const blockType = getType( blockName );
		
		if ( blockType ) {
			// Cache the FULL block type object before unregistering
			// This includes edit, save, transforms, etc.
			BLOCK_METADATA_CACHE.set( blockName, blockType );
			
			try {
				unregister( blockName );
				UNREGISTERED_BLOCKS.set( blockName, true );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `Failed to unregister block ${ blockName }:`, error );
			}
		}
	} );
}

/**
 * Re-register enabled blocks that were previously unregistered
 */
function registerEnabledBlocks( settings ) {
	if ( ! window?.wp?.blocks ) {
		return;
	}

	const { registerBlockType: register, getBlockType: getType } = window.wp.blocks;
	const enabledBlocks = getEnabledBlocks( settings );

	enabledBlocks.forEach( ( blockName ) => {
		// Only re-register if it was previously unregistered
		if ( ! UNREGISTERED_BLOCKS.has( blockName ) ) {
			return;
		}

		// Skip if already registered (might have been registered by another process)
		if ( getType( blockName ) ) {
			UNREGISTERED_BLOCKS.delete( blockName );
			BLOCK_METADATA_CACHE.delete( blockName );
			return;
		}

		// Get cached metadata
		const cachedMetadata = BLOCK_METADATA_CACHE.get( blockName );

		if ( cachedMetadata ) {
			try {
				// Re-register using the FULL cached block type
				// This preserves edit, save, transforms, and all other properties
				register( blockName, cachedMetadata );
				
				UNREGISTERED_BLOCKS.delete( blockName );
				BLOCK_METADATA_CACHE.delete( blockName );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `Failed to re-register block ${ blockName }:`, error );
			}
		}
	} );
}

/**
 * Refresh the block inserter by invalidating cache and forcing re-render
 */
function refreshBlockInserter() {
	try {
		// Invalidate inserter cache
		const blockEditorStore = dispatch( 'core/block-editor' );
		if ( blockEditorStore ) {
			if ( typeof blockEditorStore.invalidateResolution === 'function' ) {
				blockEditorStore.invalidateResolution( 'getInserterItems' );
				blockEditorStore.invalidateResolution( '__experimentalGetInserterItems' );
			}
		}

		// Also try editor store
		const editorStore = dispatch( 'core/editor' );
		if ( editorStore && typeof editorStore.invalidateResolution === 'function' ) {
			editorStore.invalidateResolution( 'getInserterItems' );
			editorStore.invalidateResolution( '__experimentalGetInserterItems' );
		}

		// Dispatch custom event
		window.dispatchEvent( new CustomEvent( 'yokoi:blocks-updated' ) );

		// Force a refresh by calling the selector
		if ( window?.wp?.data?.select ) {
			const { select: wpSelect } = window.wp.data;
			try {
				const blockEditorSelect = wpSelect( 'core/block-editor' );
				if ( blockEditorSelect ) {
					// Force refresh
					if ( typeof blockEditorSelect.getInserterItems === 'function' ) {
						blockEditorSelect.getInserterItems();
					}
					if ( typeof blockEditorSelect.__experimentalGetInserterItems === 'function' ) {
						blockEditorSelect.__experimentalGetInserterItems();
					}
				}
			} catch ( e ) {
				// Ignore errors
			}
		}

		// Try to close and reopen the inserter to force a refresh
		// This is the most reliable way to ensure blocks appear/disappear
		setTimeout( () => {
			try {
				// Try to close inserter
				const inserterButton = document.querySelector( 'button[aria-label*="Add block"], button[aria-label*="Toggle block inserter"]' );
				if ( inserterButton ) {
					// Check if inserter is open
					const inserterPanel = document.querySelector( '.block-editor-inserter__panel, .block-editor-inserter__menu' );
					if ( inserterPanel && inserterPanel.style.display !== 'none' ) {
						// Close it
						inserterButton.click();
						// Then reopen it after a short delay
						setTimeout( () => {
							inserterButton.click();
						}, 100 );
					} else {
						// Just open it
						inserterButton.click();
					}
				}
			} catch ( e ) {
				// Ignore errors - this is best effort
			}
		}, 200 );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.debug( 'Block inserter refresh:', error );
	}
}

/**
 * Update blocks based on new settings
 */
export function updateBlocks( settings ) {
	// Update window object
	if ( typeof window !== 'undefined' ) {
		window.yokoiSettings = {
			...( window.yokoiSettings || {} ),
			settings,
		};
	}
	
	// First, re-register any blocks that should be enabled
	registerEnabledBlocks( settings );
	
	// Then, unregister any blocks that should be disabled
	unregisterDisabledBlocks( settings );
	
	// Finally, refresh the inserter
	refreshBlockInserter();
}

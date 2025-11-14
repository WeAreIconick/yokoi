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
		
		if ( ! blockType ) {
			return;
		}

		// Don't unregister blocks with render_callbacks - they're PHP-based and can't be re-registered client-side
		// These blocks should be filtered via allowed_block_types_all filter instead
		if ( blockType.render ) {
			if ( window.yokoiDebug && blockName === 'yokoi/navygator' ) {
				// eslint-disable-next-line no-console
				console.debug( 'Yokoi: Skipping unregistration of NavyGator (has render_callback)' );
			}
			return;
		}

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
		// Check if block is already registered
		const existingBlock = getType( blockName );
		
		if ( existingBlock ) {
			// Block is already registered, clean up tracking if needed
			if ( UNREGISTERED_BLOCKS.has( blockName ) ) {
				UNREGISTERED_BLOCKS.delete( blockName );
			}
			// Keep metadata cached in case we need it later
			return;
		}

		// Block is not registered - try to re-register if we have cached metadata
		const cachedMetadata = BLOCK_METADATA_CACHE.get( blockName );

		if ( cachedMetadata ) {
			try {
				// Re-register using the FULL cached block type
				// This preserves edit, save, transforms, render callback, and all other properties
				register( blockName, cachedMetadata );
				
				UNREGISTERED_BLOCKS.delete( blockName );
				// Don't delete from cache - keep it for future use
				
				if ( window.yokoiDebug && blockName === 'yokoi/navygator' ) {
					// eslint-disable-next-line no-console
					console.debug( 'Yokoi: Re-registered NavyGator block', {
						hasRenderCallback: !!cachedMetadata.render,
						hasEdit: !!cachedMetadata.edit,
					} );
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `Failed to re-register block ${ blockName }:`, error );
				if ( window.yokoiDebug && blockName === 'yokoi/navygator' ) {
					// eslint-disable-next-line no-console
					console.error( 'Yokoi: NavyGator re-registration error details', error, cachedMetadata );
				}
			}
		} else {
			if ( window.yokoiDebug ) {
				// eslint-disable-next-line no-console
				console.warn( `Yokoi: Cannot re-register ${ blockName } - no cached metadata. Block may need page refresh.` );
			}
		}
	} );
}

/**
 * Refresh the block inserter by invalidating cache and forcing re-render
 * @param {boolean} forceClose - Whether to force close the inserter first
 * @returns {Promise<boolean>} - Returns true if refresh was successful
 */
export function refreshBlockInserter( forceClose = false ) {
	return new Promise( ( resolve ) => {
		try {
			// Invalidate inserter cache in all possible stores
			const blockEditorStore = dispatch( 'core/block-editor' );
			if ( blockEditorStore ) {
				if ( typeof blockEditorStore.invalidateResolution === 'function' ) {
					blockEditorStore.invalidateResolution( 'getInserterItems' );
					blockEditorStore.invalidateResolution( '__experimentalGetInserterItems' );
					blockEditorStore.invalidateResolution( 'getAllowedBlocks' );
				}
			}

			// Also try editor store
			const editorStore = dispatch( 'core/editor' );
			if ( editorStore && typeof editorStore.invalidateResolution === 'function' ) {
				editorStore.invalidateResolution( 'getInserterItems' );
				editorStore.invalidateResolution( '__experimentalGetInserterItems' );
			}

			// Try core/blocks store (if available)
			try {
				const blocksStore = dispatch( 'core/blocks' );
				if ( blocksStore && typeof blocksStore.invalidateResolution === 'function' ) {
					blocksStore.invalidateResolution( 'getBlockTypes' );
				}
			} catch ( e ) {
				// core/blocks store might not exist in all WordPress versions
			}

			// Dispatch custom event
			window.dispatchEvent( new CustomEvent( 'yokoi:blocks-updated' ) );

			// Force a refresh by calling the selector multiple times
			if ( window?.wp?.data?.select ) {
				const { select: wpSelect } = window.wp.data;
				try {
					const blockEditorSelect = wpSelect( 'core/block-editor' );
					if ( blockEditorSelect ) {
						// Force refresh multiple times to ensure it takes
						if ( typeof blockEditorSelect.getInserterItems === 'function' ) {
							blockEditorSelect.getInserterItems();
							setTimeout( () => blockEditorSelect.getInserterItems(), 100 );
						}
						if ( typeof blockEditorSelect.__experimentalGetInserterItems === 'function' ) {
							blockEditorSelect.__experimentalGetInserterItems();
							setTimeout( () => blockEditorSelect.__experimentalGetInserterItems(), 100 );
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
					// Try multiple selectors for the inserter button
					const inserterButton = document.querySelector( 
						'button[aria-label*="Add block"], ' +
						'button[aria-label*="Toggle block inserter"], ' +
						'button[aria-label*="Inserter"], ' +
						'.block-editor-inserter__toggle, ' +
						'[data-tooltip*="Add block"], ' +
						'button[aria-expanded="true"][aria-label*="block"]'
					);
					
					if ( inserterButton ) {
						// Check if inserter is open
						const inserterPanel = document.querySelector( 
							'.block-editor-inserter__panel, ' +
							'.block-editor-inserter__menu, ' +
							'.block-editor-inserter__main-area, ' +
							'.block-editor-inserter__sidebar'
						);
						
						const isOpen = inserterPanel && 
							inserterPanel.style.display !== 'none' && 
							! inserterPanel.classList.contains( 'is-hidden' ) &&
							inserterPanel.offsetParent !== null;
						
						if ( forceClose || isOpen ) {
							// Close it first
							inserterButton.click();
							// Then reopen it after a short delay
							setTimeout( () => {
								inserterButton.click();
								// Force another refresh after reopening
								setTimeout( () => {
									if ( window?.wp?.data?.select ) {
										const { select: wpSelect } = window.wp.data;
										const blockEditorSelect = wpSelect( 'core/block-editor' );
										if ( blockEditorSelect && typeof blockEditorSelect.getInserterItems === 'function' ) {
											blockEditorSelect.getInserterItems();
										}
									}
									resolve( true );
								}, 100 );
							}, 200 );
						} else {
							// Just open it to refresh
							inserterButton.click();
							setTimeout( () => {
								inserterButton.click();
								resolve( true );
							}, 300 );
						}
					} else {
						// No inserter button found, but we've invalidated cache
						// Try to trigger a refresh anyway by dispatching events
						setTimeout( () => {
							window.dispatchEvent( new Event( 'resize' ) );
							resolve( true );
						}, 100 );
					}
				} catch ( e ) {
					// Ignore errors - this is best effort
					resolve( false );
				}
			}, 200 );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.debug( 'Block inserter refresh:', error );
			resolve( false );
		}
	} );
}

/**
 * Cache all currently registered Yokoi blocks before any unregistration
 * This ensures we can re-register them later even if they were never unregistered by us
 */
function cacheAllYokoiBlocks() {
	if ( ! window?.wp?.blocks ) {
		return;
	}

	const { getBlockType, getBlockTypes } = window.wp.blocks;
	
	// Get all registered blocks
	const allBlocks = getBlockTypes ? getBlockTypes() : [];
	
	// Cache any Yokoi blocks that aren't already cached
	allBlocks.forEach( ( blockType ) => {
		if ( blockType?.name && blockType.name.startsWith( 'yokoi/' ) ) {
			// Always update cache to ensure we have the latest metadata
			// This is important for blocks like NavyGator that have render_callbacks
			BLOCK_METADATA_CACHE.set( blockType.name, blockType );
			
			if ( window.yokoiDebug && blockType.name === 'yokoi/navygator' ) {
				// eslint-disable-next-line no-console
				console.debug( 'Yokoi: Cached NavyGator block metadata', {
					name: blockType.name,
					hasRenderCallback: !!blockType.render,
					hasEdit: !!blockType.edit,
					hasSave: !!blockType.save,
				} );
			}
		}
	} );
}

/**
 * Update blocks based on new settings
 */
export function updateBlocks( settings ) {
	if ( ! window?.wp?.blocks ) {
		// WordPress blocks API not available yet
		return;
	}

	// Update window object
	if ( typeof window !== 'undefined' ) {
		window.yokoiSettings = {
			...( window.yokoiSettings || {} ),
			settings,
		};
	}
	
	const { getBlockType } = window.wp.blocks;
	const enabledBlocks = getEnabledBlocks( settings );
	const disabledBlocks = getDisabledBlocks( settings );
	
	// Cache all Yokoi blocks before we start unregistering
	// This ensures we can re-register them even if they were never unregistered
	cacheAllYokoiBlocks();
	
	// Debug: Log block states
	if ( window.yokoiDebug ) {
		// eslint-disable-next-line no-console
		console.debug( 'Yokoi: Updating blocks', {
			enabled: enabledBlocks,
			disabled: disabledBlocks,
			registered: enabledBlocks.map( name => {
				const blockType = getBlockType( name );
				return {
					name,
					registered: !!blockType,
					hasRenderCallback: blockType?.render ? true : false,
				};
			} ),
			cached: Array.from( BLOCK_METADATA_CACHE.keys() ),
		} );
	}
	
	// First, re-register any blocks that should be enabled
	registerEnabledBlocks( settings );
	
	// Then, unregister any blocks that should be disabled
	// Note: Blocks with render_callbacks (like NavyGator) won't be unregistered
	// They're filtered server-side via allowed_block_types_all filter
	unregisterDisabledBlocks( settings );
	
	// Check if NavyGator or other render_callback blocks need special handling
	const hasRenderCallbackBlocks = enabledBlocks.some( ( name ) => {
		const blockType = getBlockType( name );
		return blockType && blockType.render;
	} );
	
	// Finally, refresh the inserter
	// This is critical for blocks with render_callbacks that weren't unregistered
	// Use a longer delay for render_callback blocks to ensure server-side filter has updated
	if ( hasRenderCallbackBlocks ) {
		setTimeout( () => {
			refreshBlockInserter( true );
		}, 300 );
	} else {
		refreshBlockInserter();
	}
}

/**
 * Manually refresh the block inserter (for user-triggered refresh)
 * @returns {Promise<boolean>}
 */
export async function manualRefreshInserter() {
	return refreshBlockInserter( true );
}

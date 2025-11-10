import domReady from '@wordpress/dom-ready';

const UNREGISTERED_BLOCKS = new Set();

const getDisabledBlocks = ( settings ) => {
	if ( ! settings || ! settings.blocks_enabled ) {
		return [];
	}

	return Object.entries( settings.blocks_enabled )
		.filter( ( [ , enabled ] ) => ! enabled )
		.map( ( [ name ] ) => name );
};

const unregisterBlocks = ( settings ) => {
	if ( ! window?.wp?.blocks ) {
		return;
	}

	const { unregisterBlockType, getBlockType } = window.wp.blocks;

	getDisabledBlocks( settings ).forEach( ( blockName ) => {
		if ( UNREGISTERED_BLOCKS.has( blockName ) ) {
			return;
		}

		if ( getBlockType( blockName ) ) {
			unregisterBlockType( blockName );
			UNREGISTERED_BLOCKS.add( blockName );
		}
	} );
};

domReady( () => {
	unregisterBlocks( window?.yokoiSettings?.settings );
} );

window.addEventListener( 'yokoi:settings-updated', ( event ) => {
	unregisterBlocks( event?.detail );
} );

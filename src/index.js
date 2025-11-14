import domReady from '@wordpress/dom-ready';
import { updateBlocks } from './utils/block-registry-manager';

// Wait for WordPress to be ready
domReady( () => {
	// Wait a bit for WordPress data stores to be ready
	setTimeout( () => {
		const settings = window?.yokoiSettings?.settings;
		if ( settings ) {
			updateBlocks( settings );
		}
	}, 100 );
} );

// Listen for settings updates
window.addEventListener( 'yokoi:settings-updated', ( event ) => {
	const settings = event?.detail;
	if ( settings ) {
		// Small delay to ensure WordPress is ready
		setTimeout( () => {
			updateBlocks( settings );
		}, 50 );
	}
} );

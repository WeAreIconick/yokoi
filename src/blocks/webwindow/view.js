/**
 * WebWindow Block Frontend Script
 * Scoped, secure, and optimized for performance
 */
( function() {
	'use strict';

	const IDEAL_SITE_WIDTH = 1440;
	const IDEAL_SITE_HEIGHT = 900;

	/**
	 * Validate URL to prevent XSS attacks
	 *
	 * @param {string} url - URL to validate
	 * @return {boolean} True if URL is safe
	 */
	const isValidUrl = ( url ) => {
		if ( ! url || typeof url !== 'string' ) {
			return false;
		}

		// Reject javascript:, data:, and other dangerous protocols
		const dangerousProtocols = [ 'javascript:', 'data:', 'vbscript:', 'file:' ];
		const lowerUrl = url.toLowerCase().trim();
		
		for ( const protocol of dangerousProtocols ) {
			if ( lowerUrl.startsWith( protocol ) ) {
				return false;
			}
		}

		// Must be http:// or https://
		if ( ! lowerUrl.startsWith( 'http://' ) && ! lowerUrl.startsWith( 'https://' ) ) {
			return false;
		}

		// Basic URL validation
		try {
			const urlObj = new URL( url );
			return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
		} catch {
			return false;
		}
	};

	/**
	 * Sanitize URL for display (prevent XSS in text content)
	 *
	 * @param {string} url - URL to sanitize
	 * @return {string} Sanitized URL
	 */
	const sanitizeUrlForDisplay = ( url ) => {
		if ( ! url || typeof url !== 'string' ) {
			return '';
		}
		// Create a temporary div to escape HTML
		const div = document.createElement( 'div' );
		div.textContent = url;
		return div.innerHTML;
	};

	/**
	 * Debounce function for performance optimization
	 *
	 * @param {Function} func - Function to debounce
	 * @param {number} wait - Wait time in milliseconds
	 * @return {Function} Debounced function
	 */
	const debounce = ( func, wait ) => {
		let timeout;
		return function executedFunction( ...args ) {
			const later = () => {
				clearTimeout( timeout );
				func( ...args );
			};
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
		};
	};

	/**
	 * Update iframe scale and container height
	 *
	 * @param {HTMLIFrameElement} iframe - Iframe element
	 * @param {HTMLElement} container - Container element
	 */
	const updateScaleAndHeight = ( iframe, container ) => {
		if ( ! iframe || ! container || ! document.body.contains( iframe ) ) {
			return;
		}

		const parentWidth = container.offsetWidth || 600;
		const scale = Math.min( 1, parentWidth / IDEAL_SITE_WIDTH );
		
		// Use requestAnimationFrame for smooth updates
		requestAnimationFrame( () => {
			if ( document.body.contains( iframe ) ) {
				iframe.style.transform = `scale(${ scale })`;
				iframe.style.transformOrigin = 'top left';
				container.style.height = `${ IDEAL_SITE_HEIGHT * scale }px`;
			}
		} );
	};

	/**
	 * Initialize a single webwindow block
	 *
	 * @param {HTMLElement} block - Block element
	 */
	const initializeBlock = ( block ) => {
		// Check if already initialized
		if ( block.dataset.webwindowInitialized === 'true' ) {
			return;
		}

		const src = block.getAttribute( 'data-src' );
		const scaleToFit = block.getAttribute( 'data-scale-to-fit' ) === '1';

		// Validate URL
		if ( ! src || ! isValidUrl( src ) ) {
			return;
		}

		// Check if iframe already exists
		if ( block.querySelector( '.webwindow-js-iframe' ) ) {
			return;
		}

		const outer = block.querySelector( '.webwindow-block-embed' );
		const iframeContainer =
			block.querySelector( '.webwindow-iframe-outer' ) || outer;

		if ( ! outer || ! iframeContainer ) {
			return;
		}

		// Create iframe with security attributes
		const iframe = document.createElement( 'iframe' );
		iframe.className = 'webwindow-js-iframe';
		iframe.title = 'Embedded Web Page';
		iframe.setAttribute( 'loading', 'lazy' ); // Lazy load for performance
		iframe.setAttribute( 'referrerpolicy', 'no-referrer-when-downgrade' );
		
		// Enhanced sandbox for security with necessary permissions
		// Valid sandbox flags only
		iframe.setAttribute(
			'sandbox',
			'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-orientation-lock allow-modals'
		);
		
		// Permissions Policy for features not controlled by sandbox
		iframe.setAttribute(
			'allow',
			'autoplay; encrypted-media; fullscreen; clipboard-write; accelerometer; gyroscope; web-share'
		);
		
		// Set src only after all attributes are set
		iframe.src = src;

		// Error handling
		iframe.onerror = () => {
			const warning = document.createElement( 'div' );
			warning.className = 'webwindow-notice';
			warning.setAttribute( 'role', 'alert' );
			warning.style.cssText =
				'background: #fffbe5; border-left: 4px solid #ffb900; margin: 8px 0; padding: 8px 12px; font-size: 0.95em;';
			warning.textContent =
				'Could not display this page (site does not allow embedding, or it is unavailable).';
			
			if ( outer && document.body.contains( outer ) ) {
				outer.appendChild( warning );
				setTimeout( () => {
					if ( warning.parentNode ) {
						warning.parentNode.removeChild( warning );
					}
				}, 3500 );
			}
		};

		// Set styles based on scale-to-fit mode
		if ( scaleToFit ) {
			iframe.style.cssText =
				`width: ${ IDEAL_SITE_WIDTH }px; height: ${ IDEAL_SITE_HEIGHT }px; border: 1px solid #ddd; display: block; overflow: hidden;`;
			
			// Use requestAnimationFrame for initial scale calculation
			requestAnimationFrame( () => {
				updateScaleAndHeight( iframe, iframeContainer );
			} );

			// Debounced resize handler for performance
			const debouncedResize = debounce( () => {
				updateScaleAndHeight( iframe, iframeContainer );
			}, 150 );

			// Use passive event listener for better performance
			window.addEventListener( 'resize', debouncedResize, { passive: true } );

			// Store cleanup function
			block._webwindowCleanup = () => {
				window.removeEventListener( 'resize', debouncedResize );
			};
		} else {
			iframe.style.cssText =
				'width: 100%; min-height: 400px; border: 1px solid #ddd; overflow: auto;';
		}

		// Update URL display with sanitized value
		const urlDisplay = block.querySelector( '.browser-frame-url' );
		if ( urlDisplay ) {
			urlDisplay.textContent = sanitizeUrlForDisplay( src );
		}

		// Append iframe
		iframeContainer.appendChild( iframe );

		// Mark as initialized
		block.dataset.webwindowInitialized = 'true';
	};

	/**
	 * Initialize all webwindow blocks using IntersectionObserver for lazy loading
	 */
	const initializeWebWindowBlocks = () => {
		const blocks = document.querySelectorAll(
			'.wp-block-yokoi-webwindow[data-src]'
		);

		if ( ! blocks.length ) {
			return;
		}

		// Use IntersectionObserver for lazy loading (performance optimization)
		if ( 'IntersectionObserver' in window ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							initializeBlock( entry.target );
							observer.unobserve( entry.target );
						}
					} );
				},
				{
					rootMargin: '50px', // Start loading 50px before visible
				}
			);

			blocks.forEach( ( block ) => {
				observer.observe( block );
			} );
		} else {
			// Fallback for browsers without IntersectionObserver
			blocks.forEach( ( block ) => {
				initializeBlock( block );
			} );
		}
	};

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initializeWebWindowBlocks );
	} else {
		initializeWebWindowBlocks();
	}
} )();


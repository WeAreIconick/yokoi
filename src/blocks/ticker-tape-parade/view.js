// Scoped initialization function - prevents global namespace pollution
const initializeTicker = ( ticker ) => {
	const content = ticker.querySelector( '.yokoi-ticker__content' );
	const text = ticker.querySelector( '.yokoi-ticker__text' );

	if ( ! content || ! text ) {
		return;
	}

	// Check reduced motion preference once
	const prefersReducedMotion = window.matchMedia?.(
		'(prefers-reduced-motion: reduce)'
	)?.matches;

	if ( prefersReducedMotion ) {
		content.style.animation = 'none';
		content.style.transform = 'translateX(0)';
		return;
	}

	// Set up seamless scroll with multiple duplicates
	const speed = parseInt( ticker.dataset.speed, 10 ) || 50;
	
	// Get original content (stored in dataset or from text)
	const originalContent = text.dataset.original || text.textContent.trim();
	
	if ( ! originalContent ) {
		return;
	}
	
	// Store original content if not already stored
	if ( ! text.dataset.original ) {
		text.dataset.original = originalContent;
	}
	
	// Measure container and text width
	const containerWidth = ticker.offsetWidth || ticker.parentElement?.offsetWidth || window.innerWidth;
	
	// Temporarily set original content to measure its width
	text.textContent = originalContent;
	const textWidth = text.offsetWidth || text.scrollWidth || 200; // Fallback to 200px
	
	// Calculate duplicates needed: ensure we have enough to cover container width + buffer
	// For seamless scrolling, we need at least 2x container width worth of content
	// Use at least 3 duplicates, more for wider screens
	const minContentWidth = containerWidth * 2.5; // 2.5x container width for seamless scroll
	const duplicatesNeeded = Math.max( 3, Math.ceil( minContentWidth / textWidth ) + 1 );
	
	// Create multiple duplicates with separator
	const separator = ' • ';
	const duplicatedContent = Array( duplicatesNeeded ).fill( originalContent ).join( separator );
	
	// Update text content with duplicates
	text.textContent = duplicatedContent;
	
	// Also set data-duplicate for CSS fallback
	text.setAttribute( 'data-duplicate', originalContent );

	// Convert speed (1-100) to animation duration in seconds
	// Speed 1 = slowest (60s), Speed 100 = fastest (5s)
	const durationSeconds = Math.max( 5, 60 - ( ( speed - 1 ) * 55 / 99 ) );
	const duration = `${ Math.round( durationSeconds ) }s`;
	content.style.animationDuration = duration;
	content.style.animationName = 'yokoi-ticker-scroll';
	content.style.animationPlayState = 'running';

	// Pause/resume handlers
	const pause = () => {
		if ( content ) {
			content.style.animationPlayState = 'paused';
		}
	};

	const resume = () => {
		if ( content ) {
			content.style.animationPlayState = 'running';
		}
	};

	// Only add pause handlers if block is pausable
	const isPausable = ticker.classList.contains( 'is-pausable' );
	if ( isPausable ) {
		ticker.addEventListener( 'mouseenter', pause, { passive: true } );
		ticker.addEventListener( 'mouseleave', resume, { passive: true } );
		ticker.addEventListener( 'focusin', pause, { passive: true } );
		ticker.addEventListener( 'focusout', resume, { passive: true } );
	}

	// Store pause/resume functions on ticker for shared visibility handler
	ticker._yokoiTickerPause = pause;
	ticker._yokoiTickerResume = resume;
};

// Shared visibility handler for all tickers (prevents multiple listeners)
const handleVisibilityChange = () => {
	const tickers = document.querySelectorAll( '.yokoi-ticker-block' );
	tickers.forEach( ( ticker ) => {
		if ( document.hidden ) {
			if ( ticker._yokoiTickerPause ) {
				ticker._yokoiTickerPause();
			}
		} else if ( ! ticker.matches( ':hover, :focus-within' ) ) {
			if ( ticker._yokoiTickerResume ) {
				ticker._yokoiTickerResume();
			}
		}
	} );
};

// Debounced resize handler to recalculate duplicates on window resize
let resizeTimeout = null;
const handleResize = () => {
	if ( resizeTimeout ) {
		clearTimeout( resizeTimeout );
	}
	resizeTimeout = setTimeout( () => {
		const tickers = document.querySelectorAll( '.yokoi-ticker-block' );
		tickers.forEach( initializeTicker );
	}, 250 );
};

// Scoped setup function - prevents global conflicts
const setupTickers = () => {
	const tickers = document.querySelectorAll( '.yokoi-ticker-block' );

	if ( ! tickers.length ) {
		return;
	}

	// Initialize each ticker
	tickers.forEach( initializeTicker );

	// Add shared visibility listener once
	if ( ! window.yokoiTickerVisibilityListener ) {
		document.addEventListener( 'visibilitychange', handleVisibilityChange, { passive: true } );
		window.yokoiTickerVisibilityListener = true;
	}

	// Listen for reduced motion preference changes (only once)
	if ( window.matchMedia && ! window.yokoiTickerMotionListener ) {
		const mediaQuery = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const handleChange = () => {
			// Re-initialize all tickers when preference changes
			setupTickers();
		};
		mediaQuery.addEventListener( 'change', handleChange, { passive: true } );
		window.yokoiTickerMotionListener = true;
	}
	
	// Listen for window resize to recalculate duplicates (only once)
	if ( ! window.yokoiTickerResizeListener ) {
		window.addEventListener( 'resize', handleResize, { passive: true } );
		window.yokoiTickerResizeListener = true;
	}
};

// Initialize on DOM ready or immediately if already loaded
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', setupTickers, { once: true } );
} else {
	setupTickers();
}


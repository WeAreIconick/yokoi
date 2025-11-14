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

	// Set up seamless scroll
	const speed = parseInt( ticker.dataset.speed, 10 ) || 30;
	const textContent = text.textContent.trim();

	if ( textContent ) {
		text.setAttribute( 'data-duplicate', textContent );
	}

	// Set animation duration
	const duration = `${ Math.max( 10, 60 - speed ) }s`;
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
};

// Initialize on DOM ready or immediately if already loaded
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', setupTickers, { once: true } );
} else {
	setupTickers();
}


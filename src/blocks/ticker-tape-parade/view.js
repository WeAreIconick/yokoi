const initializeTicker = ( ticker ) => {
	const content = ticker.querySelector( '.yokoi-ticker__content' );
	const text = ticker.querySelector( '.yokoi-ticker__text' );

	if ( ! content || ! text ) {
		return;
	}

	const speed = parseInt( ticker.dataset.speed, 10 ) || 30;
	const textContent = text.textContent.trim();

	// Duplicate text for seamless scroll via data attribute.
	text.setAttribute( 'data-duplicate', textContent );

	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	if ( prefersReducedMotion ) {
		content.style.animation = 'none';
		content.style.transform = 'translateX(0)';
		return;
	}

	const duration = `${ Math.max( 10, 60 - speed ) }s`;
	content.style.animationDuration = duration;
	content.style.animationPlayState = 'running';

	const pause = () => {
		content.style.animationPlayState = 'paused';
	};

	const resume = () => {
		content.style.animationPlayState = 'running';
	};

	if ( ticker.classList.contains( 'is-pausable' ) ) {
		ticker.addEventListener( 'mouseenter', pause );
		ticker.addEventListener( 'mouseleave', resume );
		ticker.addEventListener( 'focusin', pause );
		ticker.addEventListener( 'focusout', resume );
	}

	document.addEventListener( 'visibilitychange', () => {
		if ( document.hidden ) {
			pause();
		} else if ( ! ticker.matches( ':hover, :focus-within' ) ) {
			resume();
		}
	} );
};

const setupTickers = () => {
	const tickers = document.querySelectorAll( '.yokoi-ticker-block' );

	if ( ! tickers.length ) {
		return;
	}

	tickers.forEach( initializeTicker );

	if ( window.matchMedia ) {
		const mediaQuery = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		mediaQuery.addEventListener( 'change', setupTickers );
	}
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', setupTickers );
} else {
	setupTickers();
}


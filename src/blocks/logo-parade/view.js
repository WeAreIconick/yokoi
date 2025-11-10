/**
 * Logo Parade frontend behaviour.
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const carousels = document.querySelectorAll(
		'.wp-block-yokoi-logo-parade'
	);

	if ( ! carousels.length ) {
		return;
	}

	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	carousels.forEach( ( carousel ) => {
		const track = carousel.querySelector( '.logo-parade-track' );

		if ( ! track ) {
			return;
		}

		const allItems = Array.from(
			track.querySelectorAll( '.logo-parade-item' )
		);

		const originalItems = allItems.filter(
			( item ) => ! item.hasAttribute( 'aria-hidden' )
		);

		if ( allItems.length <= 1 || originalItems.length <= 1 ) {
			return;
		}

		const rotationSpeed =
			parseInt( carousel.dataset.rotationSpeed, 10 ) || 3000;
		const transitionDuration =
			parseInt( carousel.dataset.transitionDuration, 10 ) || 500;
		const pauseOnHover = carousel.dataset.pauseOnHover !== 'false';
		const originalCount =
			parseInt( carousel.dataset.originalCount, 10 ) ||
			originalItems.length;

		if ( prefersReducedMotion ) {
			return;
		}

		let currentIndex = 0;
		let intervalId = null;
		let isTransitioning = false;
		let itemWidth = 0;
		let gap = 0;

		const recalculateMetrics = () => {
			const firstItem = allItems[ 0 ];

			if ( ! firstItem ) {
				return;
			}

			itemWidth = firstItem.getBoundingClientRect().width;
			gap = parseFloat( window.getComputedStyle( track ).gap ) || 40;
		};

		const moveToIndex = ( index, immediate = false ) => {
			if ( itemWidth <= 0 ) {
				return;
			}

			const translation = -( index * ( itemWidth + gap ) );

			if ( immediate ) {
				track.style.transition = 'none';
			}

			track.style.transform = `translateX(${ translation }px)`;

			if ( immediate ) {
				// Force reflow then restore transition.
				void track.offsetHeight;
				track.style.transition = `transform ${ transitionDuration }ms ease-in-out`;
			}
		};

		const resetCarousel = () => {
			currentIndex = 0;
			moveToIndex( 0, true );
		};

		const nextSlide = () => {
			if ( isTransitioning || itemWidth <= 0 ) {
				return;
			}

			isTransitioning = true;
			currentIndex += 1;

			const firstItem = allItems[ 0 ];

			if ( firstItem ) {
				const newWidth = firstItem.getBoundingClientRect().width;

				if ( Math.abs( newWidth - itemWidth ) > 1 ) {
					itemWidth = newWidth;
				}
			}

			moveToIndex( currentIndex );

			window.setTimeout( () => {
				if ( currentIndex >= originalCount ) {
					resetCarousel();
				}

				isTransitioning = false;
			}, transitionDuration );
		};

		const stopRotation = () => {
			if ( intervalId ) {
				window.clearInterval( intervalId );
				intervalId = null;
			}
		};

		const startRotation = () => {
			stopRotation();

			if ( originalCount > 1 ) {
				intervalId = window.setInterval( nextSlide, rotationSpeed );
			}
		};

		const initialise = () => {
			track.style.transition = `transform ${ transitionDuration }ms ease-in-out`;
			track.style.willChange = 'transform';
			recalculateMetrics();
			resetCarousel();
			startRotation();
		};

		initialise();

		if ( pauseOnHover ) {
			carousel.addEventListener( 'mouseenter', stopRotation );
			carousel.addEventListener( 'mouseleave', startRotation );
		}

		let resizeTimeout = null;
		window.addEventListener( 'resize', () => {
			window.clearTimeout( resizeTimeout );
			resizeTimeout = window.setTimeout( () => {
				stopRotation();
				recalculateMetrics();
				resetCarousel();
				startRotation();
			}, 200 );
		} );

		document.addEventListener( 'visibilitychange', () => {
			if ( document.hidden ) {
				stopRotation();
			} else {
				startRotation();
			}
		} );

		window.addEventListener( 'beforeunload', stopRotation );
	} );
} );


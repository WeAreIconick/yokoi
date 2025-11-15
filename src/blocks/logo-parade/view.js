/**
 * Logo Parade frontend behaviour - Secure, Fast, and Scoped
 * Uses Intersection Observer for performance, sanitizes all inputs, and prevents XSS
 */
( function() {
	'use strict';

	// Prevent multiple initializations
	if ( window.yokoiLogoParadeInitialized ) {
		return;
	}
	window.yokoiLogoParadeInitialized = true;

	/**
	 * Sanitize string to prevent XSS
	 * @param {string} str - String to sanitize
	 * @returns {string} Sanitized string
	 */
	const sanitizeString = ( str ) => {
		if ( typeof str !== 'string' ) {
			return '';
		}
		const div = document.createElement( 'div' );
		div.textContent = str;
		return div.textContent || '';
	};

	/**
	 * Safely parse integer with bounds checking
	 * @param {string|number} value - Value to parse
	 * @param {number} defaultValue - Default value
	 * @param {number} min - Minimum value
	 * @param {number} max - Maximum value
	 * @returns {number} Parsed and bounded integer
	 */
	const safeParseInt = ( value, defaultValue, min, max ) => {
		const parsed = parseInt( value, 10 );
		if ( isNaN( parsed ) ) {
			return defaultValue;
		}
		return Math.max( min, Math.min( max, parsed ) );
	};

	/**
	 * Debounce function for performance
	 * @param {Function} func - Function to debounce
	 * @param {number} wait - Wait time in ms
	 * @returns {Function} Debounced function
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
	 * Logo Parade Carousel Class
	 */
	class LogoParadeCarousel {
		constructor( carousel ) {
			this.carousel = carousel;
			this.track = null;
			this.allItems = [];
			this.originalItems = [];
			this.currentIndex = 0;
			this.intervalId = null;
			this.isTransitioning = false;
			this.itemWidth = 0;
			this.gap = 0;
			this.animationFrameId = null;
			this.observer = null;
			this.isVisible = false;
			this.direction = 1; // For bidirectional animation

			// Parse and sanitize attributes
			this.rotationSpeed = safeParseInt(
				carousel.dataset.rotationSpeed,
				3000,
				1000,
				10000
			);
			this.transitionDuration = safeParseInt(
				carousel.dataset.transitionDuration,
				500,
				200,
				2000
			);
			this.pauseOnHover =
				carousel.dataset.pauseOnHover !== 'false' &&
				carousel.dataset.pauseOnHover !== '0';
			this.autoPlay =
				carousel.dataset.autoPlay !== 'false' &&
				carousel.dataset.autoPlay !== '0';
			this.animationDirection = sanitizeString(
				carousel.dataset.animationDirection || 'left'
			);
			this.animationType = sanitizeString(
				carousel.dataset.animationType || 'continuous'
			);
			this.originalCount = safeParseInt(
				carousel.dataset.originalCount,
				0,
				1,
				1000
			);

			// Check for reduced motion preference
			this.prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			).matches;

			this.init();
		}

		init() {
			this.track = this.carousel.querySelector( '.logo-parade-track' );

			if ( ! this.track ) {
				return;
			}

			// Get all items safely
			const items = this.track.querySelectorAll( '.logo-parade-item' );
			this.allItems = Array.from( items );

			this.originalItems = this.allItems.filter(
				( item ) => ! item.hasAttribute( 'aria-hidden' )
			);

			if (
				this.allItems.length <= 1 ||
				this.originalItems.length <= 1 ||
				this.prefersReducedMotion ||
				! this.autoPlay
			) {
				return;
			}

			// Use Intersection Observer for performance
			this.setupIntersectionObserver();

			// Setup resize handler with debouncing
			this.setupResizeHandler();

			// Setup visibility change handler
			this.setupVisibilityHandler();

			// Setup hover handlers if enabled
			if ( this.pauseOnHover ) {
				this.setupHoverHandlers();
			}
		}

		setupIntersectionObserver() {
			if ( ! 'IntersectionObserver' in window ) {
				// Fallback for older browsers
				this.startAnimation();
				return;
			}

			this.observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.target === this.carousel ) {
							this.isVisible = entry.isIntersecting;
							if ( this.isVisible ) {
								this.startAnimation();
							} else {
								this.stopAnimation();
							}
						}
					} );
				},
				{
					rootMargin: '50px', // Start animation slightly before visible
					threshold: 0.01,
				}
			);

			this.observer.observe( this.carousel );
		}

		setupResizeHandler() {
			const handleResize = debounce( () => {
				this.stopAnimation();
				this.recalculateMetrics();
				this.resetCarousel();
				if ( this.isVisible ) {
					this.startAnimation();
				}
			}, 200 );

			window.addEventListener( 'resize', handleResize, { passive: true } );
		}

		setupVisibilityHandler() {
			const handleVisibilityChange = () => {
				if ( document.hidden ) {
					this.stopAnimation();
				} else if ( this.isVisible ) {
					this.startAnimation();
				}
			};

			document.addEventListener(
				'visibilitychange',
				handleVisibilityChange,
				{ passive: true }
			);
		}

		setupHoverHandlers() {
			const stopRotation = () => {
				this.stopAnimation();
			};
			const startRotation = () => {
				if ( this.isVisible ) {
					this.startAnimation();
				}
			};

			this.carousel.addEventListener( 'mouseenter', stopRotation, {
				passive: true,
			} );
			this.carousel.addEventListener( 'mouseleave', startRotation, {
				passive: true,
			} );
		}

		recalculateMetrics() {
			const firstItem = this.allItems[ 0 ];
			if ( ! firstItem ) {
				return;
			}

			// Use requestAnimationFrame for smooth calculations
			if ( this.animationFrameId ) {
				cancelAnimationFrame( this.animationFrameId );
			}

			this.animationFrameId = requestAnimationFrame( () => {
				const rect = firstItem.getBoundingClientRect();
				this.itemWidth = rect.width || 0;

				const computedStyle = window.getComputedStyle( this.track );
				const gapValue = computedStyle.gap || '0px';
				this.gap = parseFloat( gapValue ) || 40;
			} );
		}

		moveToIndex( index, immediate = false ) {
			if ( this.itemWidth <= 0 || ! this.track ) {
				return;
			}

			const translation = -( index * ( this.itemWidth + this.gap ) );

			if ( immediate ) {
				this.track.style.transition = 'none';
			} else {
				this.track.style.transition = `transform ${ this.transitionDuration }ms ease-in-out`;
			}

			// Use transform3d for hardware acceleration
			this.track.style.transform = `translate3d(${ translation }px, 0, 0)`;

			if ( immediate ) {
				// Force reflow
				void this.track.offsetHeight;
			}
		}

		resetCarousel() {
			this.currentIndex = 0;
			this.direction = 1;
			this.moveToIndex( 0, true );
		}

		nextSlide() {
			if ( this.isTransitioning || this.itemWidth <= 0 ) {
				return;
			}

			this.isTransitioning = true;

			// Handle bidirectional animation
			if ( this.animationDirection === 'bidirectional' ) {
				if (
					this.currentIndex >= this.originalCount - 1 ||
					this.currentIndex <= 0
				) {
					this.direction *= -1;
				}
				this.currentIndex += this.direction;
			} else if ( this.animationDirection === 'right' ) {
				this.currentIndex -= 1;
				if ( this.currentIndex < 0 ) {
					this.currentIndex = this.originalCount - 1;
				}
			} else {
				// Default: left
				this.currentIndex += 1;
			}

			// Update metrics if needed
			const firstItem = this.allItems[ 0 ];
			if ( firstItem ) {
				const newWidth = firstItem.getBoundingClientRect().width;
				if ( Math.abs( newWidth - this.itemWidth ) > 1 ) {
					this.itemWidth = newWidth;
				}
			}

			this.moveToIndex( this.currentIndex );

			window.setTimeout( () => {
				if ( this.currentIndex >= this.originalCount ) {
					this.resetCarousel();
				}

				this.isTransitioning = false;
			}, this.transitionDuration );
		}

		stopAnimation() {
			if ( this.intervalId ) {
				window.clearInterval( this.intervalId );
				this.intervalId = null;
			}
		}

		startAnimation() {
			this.stopAnimation();

			if ( this.originalCount > 1 && this.autoPlay ) {
				this.recalculateMetrics();
				this.intervalId = window.setInterval( () => {
					this.nextSlide();
				}, this.rotationSpeed );
			}
		}

		destroy() {
			this.stopAnimation();
			if ( this.observer ) {
				this.observer.disconnect();
			}
			if ( this.animationFrameId ) {
				cancelAnimationFrame( this.animationFrameId );
			}
		}
	}

	/**
	 * Initialize all carousels when DOM is ready
	 */
	const initCarousels = () => {
		const carousels = document.querySelectorAll(
			'.wp-block-yokoi-logo-parade'
		);

		if ( ! carousels.length ) {
			return;
		}

		const instances = [];

		carousels.forEach( ( carousel ) => {
			try {
				const instance = new LogoParadeCarousel( carousel );
				instances.push( instance );
			} catch ( error ) {
				// Silently fail - don't break the page
				if ( window.console && window.console.error ) {
					console.error( 'Logo Parade initialization error:', error );
				}
			}
		} );

		// Cleanup on page unload
		window.addEventListener( 'beforeunload', () => {
			instances.forEach( ( instance ) => {
				instance.destroy();
			} );
		} );
	};

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initCarousels );
	} else {
		initCarousels();
	}
} )();

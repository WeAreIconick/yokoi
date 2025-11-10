/**
 * Frontend JavaScript for the Flip Side block with multi-card carousel support.
 *
 * @package Yokoi
 */

( () => {
	'use strict';

	const CONTAINER_SELECTOR = '.wp-block-yokoi-flip-side';
	const TOGGLE_KEYS = new Set( [ 'Enter', ' ' ] );

	const parseCards = ( element ) => {
		if ( ! element ) {
			return [];
		}

		try {
			const cards = JSON.parse( element.dataset.cards || '[]' );
			return Array.isArray( cards ) ? cards : [];
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Yokoi Flip Side: invalid cards data', error );
			return [];
		}
	};

	const toBoolean = ( value ) => String( value ) === 'true';

	const sanitize = ( value ) => {
		if ( typeof value !== 'string' ) {
			return '';
		}

		const temp = document.createElement( 'div' );
		temp.textContent = value;
		return temp.innerHTML;
	};

	const updateImage = ( wrapper, card, keyPrefix ) => {
		const imageWrapper = wrapper.querySelector( '.card-image' );
		const imageUrl = sanitize( card[ `${ keyPrefix }ImageUrl` ] );
		const imageAlt = sanitize( card[ `${ keyPrefix }ImageAlt` ] );

		if ( imageUrl ) {
			if ( imageWrapper ) {
				const img = imageWrapper.querySelector( 'img' );
				if ( img ) {
					img.src = imageUrl;
					img.alt = imageAlt;
				}
			} else {
				const imgWrapper = document.createElement( 'div' );
				imgWrapper.className = 'card-image';

				const img = document.createElement( 'img' );
				img.src = imageUrl;
				img.alt = imageAlt;
				imgWrapper.appendChild( img );

				wrapper.insertBefore( imgWrapper, wrapper.firstChild );
			}
		} else if ( imageWrapper ) {
			imageWrapper.remove();
		}
	};

	const updateText = ( element, value ) => {
		if ( element ) {
			element.textContent = sanitize( value );
		}
	};

	const updateIndicators = ( indicators, index ) => {
		indicators.forEach( ( indicator, i ) => {
			const isActive = i === index;
			indicator.classList.toggle( 'active', isActive );
			indicator.setAttribute( 'aria-pressed', isActive ? 'true' : 'false' );
		} );
	};

	const updateToggleAccessibility = ( flipCard, cardIndex, totalCards, flipped ) => {
		const sideLabel = flipped
			? 'Back side – click to show front'
			: 'Front side – click to show back';

		const ariaLabel = `Card ${ cardIndex + 1 } of ${ totalCards }. ${ sideLabel }`;
		flipCard.setAttribute( 'aria-label', ariaLabel );
		flipCard.setAttribute( 'aria-pressed', flipped ? 'true' : 'false' );
	};

	const updateNavigationLabels = ( prevBtn, nextBtn, cardIndex, totalCards ) => {
		if ( prevBtn ) {
			const prevIndex = cardIndex === 0 ? totalCards : cardIndex;
			prevBtn.setAttribute( 'aria-label', `Go to card ${ prevIndex }` );
		}

		if ( nextBtn ) {
			const nextIndex = cardIndex === totalCards - 1 ? 1 : cardIndex + 2;
			nextBtn.setAttribute( 'aria-label', `Go to card ${ nextIndex }` );
		}
	};

	const initFlipCard = ( container ) => {
		const cardsData = parseCards( container );
		if ( ! cardsData.length ) {
			return;
		}

		const flipCard = container.querySelector( '.flip-card' );
		const flipCardInner = flipCard?.querySelector( '.flip-card-inner' );
		const frontContent = flipCard?.querySelector(
			'.flip-card-front .flip-card-content'
		);
		const backContent = flipCard?.querySelector(
			'.flip-card-back .flip-card-content'
		);
		const frontTitle = frontContent?.querySelector( 'h3' );
		const frontBody = frontContent?.querySelector( 'p' );
		const backTitle = backContent?.querySelector( 'h3' );
		const backBody = backContent?.querySelector( 'p' );
		const prevBtn = container.querySelector( '.carousel-nav.prev' );
		const nextBtn = container.querySelector( '.carousel-nav.next' );
		const indicatorElements = container.querySelectorAll(
			'.carousel-indicators .indicator'
		);

		if ( ! flipCard || ! flipCardInner ) {
			return;
		}

		const showNavigation = toBoolean( container.dataset.showNavigation );
		const showIndicators = toBoolean( container.dataset.showIndicators );
		const autoPlay = toBoolean( container.dataset.autoPlay );
		const autoPlayDelay = parseInt(
			container.dataset.autoPlayDelay || '5000',
			10
		);

		let cardIndex = 0;
		let flipped = false;
		let isTransitioning = false;
		let autoPlayTimer = null;

		const renderCard = ( index, animate = false ) => {
			if ( ! cardsData[ index ] || isTransitioning ) {
				return;
			}

			const card = cardsData[ index ];
			isTransitioning = true;

			if ( animate ) {
				flipCard.classList.add( 'changing' );
			}

			updateText( frontTitle, card.frontTitle );
			updateText( frontBody, card.frontContent );
			updateText( backTitle, card.backTitle );
			updateText( backBody, card.backContent );

			if ( frontContent ) {
				updateImage( frontContent, card, 'front' );
			}

			if ( backContent ) {
				updateImage( backContent, card, 'back' );
			}

			if ( showIndicators ) {
				updateIndicators( indicatorElements, index );
			}

			if ( flipped ) {
				flipCardInner.style.transform = 'rotateY(0deg)';
				flipped = false;
			}

			updateToggleAccessibility(
				flipCard,
				index,
				cardsData.length,
				flipped
			);

			updateNavigationLabels(
				prevBtn,
				nextBtn,
				index,
				cardsData.length
			);

			setTimeout( () => {
				flipCard.classList.remove( 'changing' );
				isTransitioning = false;
			}, animate ? 300 : 0 );
		};

		const goToCard = ( index ) => {
			if ( index === cardIndex ) {
				return;
			}

			cardIndex = ( index + cardsData.length ) % cardsData.length;
			renderCard( cardIndex, true );
			resetAutoPlay();
		};

		const nextCard = () => goToCard( cardIndex + 1 );
		const prevCard = () => goToCard( cardIndex - 1 );

		const toggleFlip = () => {
			if ( isTransitioning ) {
				return;
			}

			flipped = ! flipped;
			flipCardInner.style.transform = flipped
				? 'rotateY(180deg)'
				: 'rotateY(0deg)';
			updateToggleAccessibility(
				flipCard,
				cardIndex,
				cardsData.length,
				flipped
			);
			stopAutoPlay();
		};

		const startAutoPlay = () => {
			if ( ! autoPlay || cardsData.length < 2 ) {
				return;
			}

			if ( autoPlayTimer ) {
				clearInterval( autoPlayTimer );
			}

			autoPlayTimer = window.setInterval( nextCard, autoPlayDelay );
		};

		const stopAutoPlay = () => {
			if ( autoPlayTimer ) {
				clearInterval( autoPlayTimer );
				autoPlayTimer = null;
			}
		};

		const resetAutoPlay = () => {
			stopAutoPlay();
			startAutoPlay();
		};

		const handleFlipKeydown = ( event ) => {
			if ( TOGGLE_KEYS.has( event.key ) ) {
				event.preventDefault();
				toggleFlip();
			}
		};

		const handleFlipClick = ( event ) => {
			if ( 'ontouchstart' in window || cardsData.length === 1 ) {
				event.preventDefault();
				toggleFlip();
			}
		};

		const handleFlipTouchstart = ( event ) => {
			event.preventDefault();
			toggleFlip();
		};

		const handleIndicatorEvent = ( indicatorIndex ) => ( event ) => {
			if (
				event.type === 'keydown' &&
				! TOGGLE_KEYS.has( event.key )
			) {
				return;
			}

			event.preventDefault();
			goToCard( indicatorIndex );
		};

		const handleContainerKeydown = ( event ) => {
			switch ( event.key ) {
				case 'ArrowLeft':
					event.preventDefault();
					prevCard();
					break;
				case 'ArrowRight':
					event.preventDefault();
					nextCard();
					break;
				case 'Home':
					event.preventDefault();
					goToCard( 0 );
					break;
				case 'End':
					event.preventDefault();
					goToCard( cardsData.length - 1 );
					break;
				default:
					break;
			}
		};

		const handleVisibilityChange = () => {
			if ( document.hidden ) {
				stopAutoPlay();
			} else {
				startAutoPlay();
			}
		};

		const handleCleanup = () => {
			stopAutoPlay();
			document.removeEventListener( 'visibilitychange', handleVisibilityChange );
		};

		renderCard( cardIndex );

		flipCard.setAttribute( 'role', 'button' );
		flipCard.setAttribute( 'tabindex', '0' );

		flipCard.addEventListener( 'keydown', handleFlipKeydown );
		flipCard.addEventListener( 'click', handleFlipClick );
		flipCard.addEventListener( 'touchstart', handleFlipTouchstart, {
			passive: false,
		} );

		if ( showNavigation && prevBtn && nextBtn ) {
			prevBtn.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				prevCard();
			} );
			prevBtn.addEventListener( 'keydown', handleIndicatorEvent( -1 ) );

			nextBtn.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				nextCard();
			} );
			nextBtn.addEventListener( 'keydown', handleIndicatorEvent( 1 ) );
		}

		if ( showIndicators ) {
			indicatorElements.forEach( ( indicator, index ) => {
				indicator.setAttribute( 'role', 'button' );
				indicator.setAttribute( 'tabindex', '0' );

				indicator.addEventListener(
					'click',
					handleIndicatorEvent( index )
				);
				indicator.addEventListener(
					'keydown',
					handleIndicatorEvent( index )
				);
			} );
		}

		container.addEventListener( 'keydown', handleContainerKeydown );
		container.addEventListener( 'mouseenter', stopAutoPlay );
		container.addEventListener( 'mouseleave', startAutoPlay );
		container.addEventListener( 'focusin', stopAutoPlay );
		container.addEventListener( 'focusout', startAutoPlay );

		document.addEventListener(
			'visibilitychange',
			handleVisibilityChange
		);
		startAutoPlay();

		container.addEventListener( 'yokoi:flip-side:cleanup', handleCleanup );
	};

	const initAllFlipCards = () => {
		const containers = document.querySelectorAll( CONTAINER_SELECTOR );
		if ( ! containers.length ) {
			return;
		}

		containers.forEach( initFlipCard );
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAllFlipCards );
	} else {
		initAllFlipCards();
	}

	if (
		typeof window !== 'undefined' &&
		window.wp &&
		window.wp.hooks &&
		typeof window.wp.hooks.addAction === 'function'
	) {
		window.wp.hooks.addAction(
			'yokoi.flip-side.init',
			'yokoi/flip-side',
			initAllFlipCards
		);
	}
} )();


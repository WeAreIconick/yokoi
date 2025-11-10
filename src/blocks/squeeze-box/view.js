/**
 * Front-end enhancements for the Squeeze Box block.
 */

( () => {
	const debounce = ( fn, wait ) => {
		let timeout;
		return ( ...args ) => {
			clearTimeout( timeout );
			timeout = setTimeout( () => fn.apply( null, args ), wait );
		};
	};

	const isElement = ( node ) =>
		node &&
		node.nodeType === Node.ELEMENT_NODE &&
		typeof node.addEventListener === 'function';

	const safeGetHeight = ( element ) => {
		try {
			if ( ! isElement( element ) ) {
				return 0;
			}
			return element.scrollHeight || 0;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Error calculating height:', error );
			return 0;
		}
	};

	const safeSetStyle = ( element, property, value ) => {
		try {
			if (
				! isElement( element ) ||
				! element.style ||
				typeof property !== 'string' ||
				typeof value !== 'string'
			) {
				return;
			}

			const allowed = [ 'maxHeight', 'max-height' ];
			if ( ! allowed.includes( property ) ) {
				return;
			}

			element.style[ property ] = value;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Error setting style:', error );
		}
	};

	const updateContentHeight = ( input, content ) => {
		if ( ! isElement( input ) || ! isElement( content ) ) {
			return;
		}

		try {
			if ( input.checked ) {
				const height = safeGetHeight( content );
				if ( height > 0 && height < 10000 ) {
					safeSetStyle( content, 'maxHeight', `${ height }px` );
				}
			} else {
				safeSetStyle( content, 'maxHeight', '0' );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Error updating content height:', error );
		}
	};

	const initializeTab = ( tab ) => {
		if ( ! isElement( tab ) ) {
			return;
		}

		try {
			const input = tab.querySelector(
				'input[type="checkbox"], input[type="radio"]'
			);
			const content = tab.querySelector( '.tab__content' );

			if ( ! isElement( input ) || ! isElement( content ) ) {
			 return;
			}

			const inputType = input.getAttribute( 'type' );
			if ( inputType !== 'checkbox' && inputType !== 'radio' ) {
				return;
			}

			updateContentHeight( input, content );

			input.addEventListener( 'change', ( event ) => {
				try {
					if ( event && event.target === input ) {
						updateContentHeight( input, content );
					}
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.warn( 'Error in change event:', error );
				}
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Error initializing tab:', error );
		}
	};

	const initSqueezeBoxes = () => {
		try {
			const containers = document.querySelectorAll(
				'.wp-block-yokoi-squeeze-box .squeeze-box'
			);

			if ( ! containers || ! containers.length ) {
				return;
			}

			containers.forEach( ( squeezeBox ) => {
				if ( ! isElement( squeezeBox ) ) {
					return;
				}

				const tabs = squeezeBox.querySelectorAll( '.tab' );
				if ( ! tabs || ! tabs.length ) {
					return;
				}

				tabs.forEach( initializeTab );
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error initializing squeeze boxes:', error );
		}
	};

	const handleResize = debounce( () => {
		try {
			const containers = document.querySelectorAll(
				'.wp-block-yokoi-squeeze-box .squeeze-box'
			);

			containers.forEach( ( squeezeBox ) => {
				if ( ! isElement( squeezeBox ) ) {
					return;
				}

				const tabs = squeezeBox.querySelectorAll( '.tab' );
				tabs.forEach( ( tab ) => {
					const input = tab.querySelector(
						'input[type="checkbox"], input[type="radio"]'
					);
					const content = tab.querySelector( '.tab__content' );

					if ( isElement( input ) && isElement( content ) && input.checked ) {
						safeSetStyle( content, 'maxHeight', 'none' );
						setTimeout( () => {
							updateContentHeight( input, content );
						}, 0 );
					}
				} );
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Error handling resize:', error );
		}
	}, 250 );

	const init = () => {
		try {
			initSqueezeBoxes();
			if ( typeof window !== 'undefined' && window.addEventListener ) {
				window.addEventListener( 'resize', handleResize, {
					passive: true,
				} );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error during initialization:', error );
		}
	};

	if ( typeof document !== 'undefined' ) {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', init );
		} else {
			init();
		}
	}

	if (
		typeof window !== 'undefined' &&
		window.wp &&
		window.wp.hooks &&
		typeof window.wp.hooks.addAction === 'function'
	) {
		window.wp.hooks.addAction(
			'blocks.block_added',
			'yokoi/squeeze-box',
			initSqueezeBoxes
		);
	}
} )();


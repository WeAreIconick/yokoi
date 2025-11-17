/* global poppitAjax, localStorage */

/**
 * Frontend JavaScript for Poppit
 * Handles popup triggers, display logic, and user interactions
 * Security-focused implementation with proper error handling
 */

class Poppit {
	constructor() {
		this.popups = [];
		this.isReady = false;
		this.visitorType = this.getVisitorType();
		this.deviceType = this.getDeviceType();
		this.triggeredPopups = new Set();
		this.scrollDepths = new Map();
		this.timers = new Map();
		this.sessionShownPopups = new Set();
		this.rateLimits = new Map(); // Rate limiting for API calls

		this.init();
	}

	init() {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', () =>
				this.onReady()
			);
		} else {
			this.onReady();
		}
	}

	onReady() {
		this.isReady = true;
		this.findPopups();
		this.setupEventListeners();
		// Small delay to ensure all DOM elements are ready
		setTimeout( () => {
			this.processPopups();
		}, 100 );
		
		// Also try to find popups after a longer delay in case blocks load late
		setTimeout( () => {
			if ( this.popups.length === 0 ) {
				this.findPopups();
				this.processPopups();
			}
		}, 500 );
	}

	findPopups() {
		try {
			const popupBlocks = document.querySelectorAll( '[data-popup-id]' );

			if ( popupBlocks.length === 0 ) {
				// Try alternative selector in case block wrapper class is different
				const altBlocks = document.querySelectorAll( '.poppit-block[data-popup-id]' );
				if ( altBlocks.length > 0 ) {
					altBlocks.forEach( ( block ) => {
						const popupData = this.extractPopupData( block );
						if ( popupData && this.shouldShowPopup( popupData ) ) {
							this.popups.push( popupData );
						}
					} );
					return;
				}
			}

			popupBlocks.forEach( ( block ) => {
				const popupData = this.extractPopupData( block );
				if ( popupData && this.shouldShowPopup( popupData ) ) {
					this.popups.push( popupData );
				}
			} );
		} catch ( error ) {
			// Silent error handling
		}
	}

	extractPopupData( block ) {
		try {
			// Check if block has required data attribute
			if ( ! block || ! block.dataset || ! block.dataset.popupId ) {
				return null;
			}

			const data = {
				id: this.sanitizeString( block.dataset.popupId || '' ),
				type: this.sanitizeString( block.dataset.popupType || 'modal' ),
				triggerType: this.sanitizeString(
					block.dataset.triggerType || 'time'
				),
				triggerDelay: this.sanitizeNumber(
					block.dataset.triggerDelay,
					3,
					0,
					300
				),
				scrollDepth: this.sanitizeNumber(
					block.dataset.scrollDepth,
					50,
					0,
					100
				),
				exitIntent: block.dataset.exitIntent === 'true',
				targeting: this.parseJSON( block.dataset.targeting, {
					devices: [ 'desktop', 'tablet', 'mobile' ],
					userType: 'all',
				} ),
				allowReset: block.dataset.allowReset === 'true',
				resetDelay: this.sanitizeNumber(
					block.dataset.resetDelay,
					60,
					1,
					10080
				), // Max 1 week
				element: block,
				shown: false,
				timestamp: Date.now(),
			};

			// Validate required ID
			if ( ! data.id || data.id.length > 50 ) {
				return null;
			}

			return data;
		} catch ( error ) {
			return null;
		}
	}

	// Utility functions for data sanitization
	sanitizeString( str, maxLength = 100 ) {
		if ( typeof str !== 'string' ) {
			return '';
		}
		return str.trim().substring( 0, maxLength );
	}

	sanitizeNumber(
		value,
		defaultValue = 0,
		min = 0,
		max = Number.MAX_SAFE_INTEGER
	) {
		const num = parseInt( value, 10 );
		if ( isNaN( num ) ) {
			return defaultValue;
		}
		return Math.min( Math.max( num, min ), max );
	}

	parseJSON( jsonStr, defaultValue = {} ) {
		try {
			if ( ! jsonStr ) {
				return defaultValue;
			}
			const parsed = JSON.parse( jsonStr );
			return typeof parsed === 'object' && parsed !== null
				? parsed
				: defaultValue;
		} catch ( error ) {
			return defaultValue;
		}
	}

	getUrlParam( param ) {
		const urlParams = new URLSearchParams( window.location.search );
		return urlParams.get( param );
	}

	shouldShowPopup( popup ) {
		try {
			// Check device targeting
			if ( ! popup.targeting.devices.includes( this.deviceType ) ) {
				return false;
			}

			// Check visitor type targeting
			if (
				popup.targeting.userType !== 'all' &&
				popup.targeting.userType !== this.visitorType
			) {
				return false;
			}

			// Check if popup was already shown in current session
			if ( this.sessionShownPopups.has( popup.id ) ) {
				return false;
			}

			// Check if popup was already shown with reset logic
			return this.checkPopupResetStatus( popup );
		} catch ( error ) {
			return false;
		}
	}

	checkPopupResetStatus( popup ) {
		try {
			const storageKey = `poppit_${ popup.id }`;
			const storedData = localStorage.getItem( storageKey );

			if ( ! storedData ) {
				return true;
			}

			const data = this.parseJSON( storedData );
			if ( ! data.lastShown ) {
				return true;
			}

			const lastShown = new Date( data.lastShown );
			const now = new Date();

			// If reset is not allowed, never show again
			if ( ! popup.allowReset ) {
				return false;
			}

			// Calculate time since last shown
			const minutesSinceLastShown = ( now - lastShown ) / ( 1000 * 60 );
			const resetDelayMinutes = popup.resetDelay;

			if ( minutesSinceLastShown >= resetDelayMinutes ) {
				return true;
			}
			return false;
		} catch ( error ) {
			return true;
		}
	}

	processPopups() {
		try {
			this.popups.forEach( ( popup ) => {
				// Clear any existing setup for this popup
				this.clearPopupTriggers( popup.id );

				switch ( popup.triggerType ) {
					case 'time':
						this.setupTimeBasedTrigger( popup );
						break;
					case 'scroll':
						this.setupScrollTrigger( popup );
						break;
					case 'exit':
						this.setupExitIntentTrigger( popup );
						break;
					case 'load':
						// Add small delay even for immediate triggers
						setTimeout( () => this.showPopup( popup ), 100 );
						break;
				}
			} );
		} catch ( error ) {
			// Silent error handling
		}
	}

	clearPopupTriggers( popupId ) {
		// Clear any existing timer
		if ( this.timers.has( popupId ) ) {
			clearTimeout( this.timers.get( popupId ) );
			this.timers.delete( popupId );
		}

		// Remove from triggered set
		this.triggeredPopups.delete( popupId );

		// Clear scroll depth tracking
		this.scrollDepths.delete( popupId );
	}

	setupTimeBasedTrigger( popup ) {
		const delay = Math.max( popup.triggerDelay * 1000, 100 );

		const timerId = setTimeout( () => {
			if ( ! this.triggeredPopups.has( popup.id ) ) {
				this.showPopup( popup );
			}
			this.timers.delete( popup.id );
		}, delay );

		this.timers.set( popup.id, timerId );
	}

	setupScrollTrigger( popup ) {
		this.scrollDepths.set( popup.id, {
			popup,
			targetDepth: popup.scrollDepth,
			triggered: false,
		} );
	}

	setupExitIntentTrigger( popup ) {
		let exitIntentFired = false;

		const handleMouseLeave = ( e ) => {
			if ( exitIntentFired || this.triggeredPopups.has( popup.id ) ) {
				return;
			}

			if (
				e.clientY <= 0 ||
				( e.relatedTarget === null &&
					e.target === document.documentElement )
			) {
				exitIntentFired = true;
				this.showPopup( popup );
				document.removeEventListener( 'mouseleave', handleMouseLeave );
				document.removeEventListener( 'mousemove', handleMouseMove );
			}
		};

		let lastMouseY = 0;
		const handleMouseMove = ( e ) => {
			if ( exitIntentFired || this.triggeredPopups.has( popup.id ) ) {
				return;
			}

			if ( e.clientY < 100 && lastMouseY > e.clientY + 50 ) {
				exitIntentFired = true;
				this.showPopup( popup );
				document.removeEventListener( 'mouseleave', handleMouseLeave );
				document.removeEventListener( 'mousemove', handleMouseMove );
			}
			lastMouseY = e.clientY;
		};

		document.addEventListener( 'mouseleave', handleMouseLeave );
		document.addEventListener( 'mousemove', handleMouseMove );
	}

	setupEventListeners() {
		try {
			// Scroll listener with debouncing
			let scrollTimeout;
			window.addEventListener(
				'scroll',
				() => {
					clearTimeout( scrollTimeout );
					scrollTimeout = setTimeout( () => {
						this.handleScroll();
					}, 100 );
				},
				{ passive: true }
			);

			// Close popup listeners
			document.addEventListener( 'click', ( e ) => {
				if (
					e.target &&
					( e.target.classList.contains( 'popup-close' ) ||
						( e.target.classList.contains( 'popup-overlay' ) &&
							e.target === e.currentTarget ) )
				) {
					e.preventDefault();
					this.closePopup( e.target.closest( '.popup-overlay' ) );
				}
			} );

			// Escape key listener
			document.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Escape' ) {
					this.closeAllPopups();
				}
			} );

			// Form submission listener
			document.addEventListener( 'submit', ( e ) => {
				if (
					e.target &&
					e.target.classList.contains( 'popup-email-form' )
				) {
					e.preventDefault();
					this.handleEmailSubmission( e.target );
				}
			} );
		} catch ( error ) {
			// Silent error handling
		}
	}

	handleScroll() {
		try {
			const scrollTop =
				window.pageYOffset || document.documentElement.scrollTop;
			const scrollHeight =
				document.body.scrollHeight - window.innerHeight;
			const scrollPercent =
				scrollHeight > 0 ? ( scrollTop / scrollHeight ) * 100 : 0;

			this.scrollDepths.forEach( ( data, popupId ) => {
				if (
					! data.triggered &&
					! this.triggeredPopups.has( popupId ) &&
					scrollPercent >= data.targetDepth
				) {
					data.triggered = true;
					this.showPopup( data.popup );
					this.scrollDepths.delete( popupId );
				}
			} );
		} catch ( error ) {
			// Silent error handling
		}
	}

	showPopup( popup ) {
		try {
			if ( popup.shown || this.triggeredPopups.has( popup.id ) ) {
				return;
			}

			this.triggeredPopups.add( popup.id );
			this.sessionShownPopups.add( popup.id );
			popup.shown = true;

			// Clear any pending timer for this popup
			if ( this.timers.has( popup.id ) ) {
				clearTimeout( this.timers.get( popup.id ) );
				this.timers.delete( popup.id );
			}

			// Create popup HTML
			const popupHTML = this.createPopupHTML( popup );
			document.body.insertAdjacentHTML( 'beforeend', popupHTML );

			// Trigger animation
			const overlay = document.getElementById( `popup-${ popup.id }` );
			if ( overlay ) {
				void overlay.offsetHeight; // Force reflow
				window.requestAnimationFrame( () => {
					overlay.classList.add( 'popup-active' );
				} );
			}

			// Track display event
			this.trackEvent( popup.id, 'display' );

			// Store in localStorage
			try {
				const storageKey = `poppit_${ popup.id }`;
				const data = {
					lastShown: new Date().toISOString(),
					showCount: this.getShowCount( popup.id ) + 1,
				};
				localStorage.setItem( storageKey, JSON.stringify( data ) );
			} catch ( storageError ) {
				// Silent error handling
			}
		} catch ( error ) {
			// Silent error handling
		}
	}

	getShowCount( popupId ) {
		try {
			const storageKey = `poppit_${ popupId }`;
			const storedData = localStorage.getItem( storageKey );

			if ( storedData ) {
				const data = this.parseJSON( storedData );
				return data.showCount || 0;
			}
		} catch ( error ) {
			// Silent error handling
		}

		return 0;
	}

	createPopupHTML( popup ) {
		try {
			const element = popup.element;
			if ( ! element ) {
				return '';
			}

			// Sanitize content from DOM
			const titleEl = element.querySelector( '.popup-title' );
			const contentEl = element.querySelector( '.popup-text' );

			const title = titleEl ? this.sanitizeHTML( titleEl.innerHTML ) : '';
			const content = contentEl
				? this.sanitizeHTML( contentEl.innerHTML )
				: '';

			// Get sanitized attributes
			const emailEnabled = element.dataset.emailEnabled === 'true';
			const emailPlaceholder = this.sanitizeString(
				element.dataset.emailPlaceholder || 'Enter your email',
				100
			);
			const buttonText = this.sanitizeString(
				element.dataset.buttonText || 'Subscribe',
				50
			);
			const showCloseButton = element.dataset.showCloseButton !== 'false';
			const overlayOpacity =
				this.sanitizeNumber(
					element.dataset.overlayOpacity * 100,
					80,
					0,
					100
				) / 100;
			const animation = this.sanitizeString(
				element.dataset.animation || 'fadeIn',
				20
			);

			return `
				<div class="popup-overlay animation-${ animation }" id="popup-${
					popup.id
				}" style="background: rgba(0, 0, 0, ${ overlayOpacity })">
					<div class="popup-container popup-${
						popup.type
					}" role="dialog" aria-modal="true" aria-labelledby="popup-title-${
						popup.id
					}">
						${
							showCloseButton
								? `<button class="popup-close" aria-label="Close popup">×</button>`
								: ''
						}
						<div class="popup-content">
							${
								title
									? `<h3 class="popup-title" id="popup-title-${ popup.id }">${ title }</h3>`
									: ''
							}
							${ content ? `<div class="popup-text">${ content }</div>` : '' }
							${
								emailEnabled
									? `
								<form class="popup-email-form" data-popup-id="${ popup.id }" novalidate>
									<input type="email" class="popup-email-input" placeholder="${ emailPlaceholder }" required autocomplete="email" maxlength="254">
									<button type="submit" class="popup-submit-btn">${ buttonText }</button>
								</form>
							`
									: ''
							}
						</div>
					</div>
				</div>
			`;
		} catch ( error ) {
			return '';
		}
	}

	// Basic HTML sanitization (for display content only)
	sanitizeHTML( html ) {
		const div = document.createElement( 'div' );
		div.textContent = html;
		return div.innerHTML;
	}

	closePopup( overlay ) {
		try {
			if ( ! overlay ) {
				return;
			}

			overlay.classList.remove( 'popup-active' );

			setTimeout( () => {
				if ( overlay.parentNode ) {
					overlay.remove();
				}
			}, 300 );

			const popupId = overlay.id.replace( 'popup-', '' );
			if ( popupId ) {
				this.trackEvent( popupId, 'close' );
			}
		} catch ( error ) {
			// Silent error handling
		}
	}

	closeAllPopups() {
		try {
			const activePopups = document.querySelectorAll(
				'.popup-overlay.popup-active'
			);
			activePopups.forEach( ( popup ) => this.closePopup( popup ) );
		} catch ( error ) {
			// Silent error handling
		}
	}

	handleEmailSubmission( form ) {
		try {
			const emailInput = form.querySelector( 'input[type="email"]' );
			const submitBtn = form.querySelector( '.popup-submit-btn' );
			const popupId = this.sanitizeString( form.dataset.popupId || '' );

			if ( ! emailInput || ! submitBtn || ! popupId ) {
				return;
			}

			const email = emailInput.value.trim();

			// Client-side email validation
			if ( ! this.isValidEmail( email ) ) {
				this.showFormError(
					form,
					'Please enter a valid email address.'
				);
				return;
			}

			// Rate limiting check
			if ( this.isRateLimited( 'email', popupId ) ) {
				this.showFormError(
					form,
					'Please wait before submitting again.'
				);
				return;
			}

			// Disable button and show loading state
			const originalText = submitBtn.textContent;
			submitBtn.disabled = true;
			submitBtn.textContent = 'Submitting...';

			// Clear any existing errors
			this.clearFormError( form );

			// Submit email
			if ( typeof poppitAjax !== 'undefined' && poppitAjax.ajaxurl ) {
				const formData = new FormData();
				formData.append( 'action', 'poppit_email' );
				formData.append( 'nonce', poppitAjax.nonce );
				formData.append( 'email', email );
				formData.append( 'popup_id', popupId );
				formData.append( 'page_url', window.location.href );

				fetch( poppitAjax.ajaxurl, {
					method: 'POST',
					body: formData,
					credentials: 'same-origin',
				} )
					.then( ( response ) => {
						if ( ! response.ok ) {
							throw new Error(
								`HTTP error! status: ${ response.status }`
							);
						}
						return response.json();
					} )
					.then( ( data ) => {
						if ( data && data.success ) {
							// Show success message
							form.innerHTML =
								'<div class="popup-success">Thank you for subscribing!</div>';
							this.trackEvent( popupId, 'email_submit' );

							// Auto-close after success
							setTimeout( () => {
								this.closePopup(
									document.getElementById(
										`popup-${ popupId }`
									)
								);
							}, 2000 );
						} else {
							throw new Error(
								data?.data || 'Submission failed'
							);
						}
					} )
					.catch( ( error ) => {
						submitBtn.disabled = false;
						submitBtn.textContent = originalText;

						this.showFormError(
							form,
							'Something went wrong. Please try again.'
						);
					} );
			} else {
				// Fallback if AJAX is not available
				form.innerHTML =
					'<div class="popup-success">Thank you for subscribing!</div>';
				setTimeout( () => {
					this.closePopup(
						document.getElementById( `popup-${ popupId }` )
					);
				}, 2000 );
			}
		} catch ( error ) {
			// Silent error handling
		}
	}

	// Email validation
	isValidEmail( email ) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test( email ) && email.length <= 254;
	}

	// Rate limiting
	isRateLimited( action, identifier ) {
		const key = `${ action }_${ identifier }`;
		const now = Date.now();
		const limit = this.rateLimits.get( key );

		if ( limit && now - limit.lastAction < limit.cooldown ) {
			return true;
		}

		this.rateLimits.set( key, {
			lastAction: now,
			cooldown: 2000, // 2 second cooldown
		} );

		return false;
	}

	showFormError( form, message ) {
		this.clearFormError( form );
		const errorDiv = document.createElement( 'div' );
		errorDiv.className = 'popup-error';
		errorDiv.textContent = message;
		form.appendChild( errorDiv );
	}

	clearFormError( form ) {
		const existingError = form.querySelector( '.popup-error' );
		if ( existingError ) {
			existingError.remove();
		}
	}

	trackEvent( popupId, eventType ) {
		try {
			if ( typeof poppitAjax !== 'undefined' && poppitAjax.ajaxurl ) {
				// Rate limiting for tracking calls
				if ( this.isRateLimited( 'track', popupId ) ) {
					return;
				}

				const formData = new FormData();
				formData.append( 'action', 'poppit_track' );
				formData.append( 'nonce', poppitAjax.nonce );
				formData.append( 'popup_id', popupId );
				formData.append( 'event_type', eventType );
				formData.append( 'page_url', window.location.href );

				fetch( poppitAjax.ajaxurl, {
					method: 'POST',
					body: formData,
					credentials: 'same-origin',
				} ).catch( () => {
					// Silent error handling
				} );
			}
		} catch ( error ) {
			// Silent error handling
		}
	}

	getVisitorType() {
		try {
			const visited = localStorage.getItem( 'poppit_visited' );
			if ( visited ) {
				return 'returning';
			}
			localStorage.setItem( 'poppit_visited', 'true' );
			return 'new';
		} catch ( error ) {
			// Fallback if localStorage is not available
			return 'new';
		}
	}

	getDeviceType() {
		const width = window.innerWidth;
		if ( width <= 768 ) {
			return 'mobile';
		}
		if ( width <= 1024 ) {
			return 'tablet';
		}
		return 'desktop';
	}

}

// Initialize when DOM is ready
try {
	new Poppit();
} catch ( error ) {
	// Silent error handling
}

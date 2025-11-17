/**
 * NavyGator Table of Contents - Frontend JavaScript
 * 
 * Scoped, secure, and optimized for performance
 */

( function() {
	'use strict';

	// Prevent duplicate execution
	if ( window.navygatorInitialized ) {
		return;
	}
	window.navygatorInitialized = true;

	// Cache mobile breakpoint
	const MOBILE_BREAKPOINT = 768;

	// Throttle function for performance
	function throttle( func, limit ) {
		let inThrottle;
		return function( ...args ) {
			if ( ! inThrottle ) {
				func.apply( this, args );
				inThrottle = true;
				setTimeout( () => inThrottle = false, limit );
			}
		};
	}

	// Validate and sanitize ID - security critical
	function sanitizeId( id ) {
		if ( ! id || typeof id !== 'string' ) {
			return null;
		}
		// Only allow alphanumeric, hyphens, and underscores - prevent XSS
		const sanitized = id.replace( /[^a-zA-Z0-9_-]/g, '' );
		// Additional check: ensure it's not empty and not too long
		return sanitized && sanitized.length <= 100 ? sanitized : null;
	}

	// Check if element is in viewport - optimized
	function isInViewport( element ) {
		if ( ! element || ! document.body.contains( element ) ) {
			return false;
		}
		const rect = element.getBoundingClientRect();
		return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
	}

	// Wait for DOM to be ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	function init() {
		// Scope selector to block wrapper for security
		const blockWrapper = document.querySelector( '.wp-block-yokoi-navygator' );
		if ( ! blockWrapper || ! document.body.contains( blockWrapper ) ) {
			return;
		}

		const tocWrapper = blockWrapper.querySelector( '.navygator-toc-wrapper' );
		if ( ! tocWrapper || ! document.body.contains( tocWrapper ) ) {
			return;
		}

		// Cache all elements for performance
		const toc = tocWrapper.querySelector( '.navygator-toc' );
		const toggleBtn = tocWrapper.querySelector( '.navygator-toc-toggle' );
		const closeBtn = tocWrapper.querySelector( '.navygator-toc-close' );
		const backdrop = tocWrapper.querySelector( '.navygator-toc-backdrop' );
		const tocLinks = Array.from( tocWrapper.querySelectorAll( '.navygator-toc-link' ) );

		// Cache window width to avoid repeated reads
		let isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
		const updateMobileState = throttle( () => {
			isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
		}, 150 );
		window.addEventListener( 'resize', updateMobileState, { passive: true } );

		// Toggle functionality
		if ( toggleBtn ) {
			toggleBtn.addEventListener( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				if ( isMobile ) {
					openDrawer();
				} else {
					toggleDesktopToc();
				}
			}, { passive: false } );
		}

		if ( closeBtn ) {
			closeBtn.addEventListener( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				if ( isMobile ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}
			}, { passive: false } );
		}

		if ( backdrop ) {
			backdrop.addEventListener( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				closeDrawer();
			}, { passive: false } );
		}

		// Close on escape key
		const handleEscape = ( e ) => {
			if ( e.key === 'Escape' && toc && toc.classList.contains( 'is-open' ) ) {
				if ( isMobile ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}
			}
		};
		document.addEventListener( 'keydown', handleEscape, { passive: true } );

		// Smooth scroll on link click - optimized
		tocLinks.forEach( function( link ) {
			link.addEventListener( 'click', function( e ) {
				e.preventDefault();
				
				const href = this.getAttribute( 'href' );
				if ( ! href || ! href.startsWith( '#' ) ) {
					return;
				}
				
				const targetId = sanitizeId( href.substring( 1 ) );
				if ( ! targetId ) {
					return;
				}
				
				const targetElement = document.getElementById( targetId );
				// Security: verify element exists and is in the document
				if ( ! targetElement || ! document.body.contains( targetElement ) ) {
					return;
				}

				// Close TOC
				if ( isMobile ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}

				// Smooth scroll - use requestAnimationFrame for performance
				requestAnimationFrame( () => {
					const yOffset = -20;
					const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

					window.scrollTo( {
						top: Math.max( 0, y ),
						behavior: 'smooth'
					} );

					// Update URL hash securely
					if ( history && history.pushState ) {
						try {
							history.pushState( null, '', '#' + encodeURIComponent( targetId ) );
						} catch ( err ) {
							// Silently fail if pushState fails
						}
					}
				} );
			}, { passive: true } );
		} );

		// Scroll spy - only if links exist
		if ( tocLinks.length > 0 ) {
			setupScrollSpy( tocLinks, tocWrapper );
		}

		function openDrawer() {
			if ( toc ) {
				toc.classList.add( 'is-open' );
			}
			if ( backdrop ) {
				backdrop.classList.add( 'is-visible' );
			}
			document.body.classList.add( 'navygator-toc-open' );
		}

		function closeDrawer() {
			if ( toc ) {
				toc.classList.remove( 'is-open' );
			}
			if ( backdrop ) {
				backdrop.classList.remove( 'is-visible' );
			}
			document.body.classList.remove( 'navygator-toc-open' );
		}

		function toggleDesktopToc() {
			if ( toc ) {
				const isOpen = toc.classList.contains( 'is-open' );
				if ( isOpen ) {
					closeDesktopToc();
				} else {
					openDesktopToc();
				}
			}
		}

		function openDesktopToc() {
			if ( toc ) {
				toc.classList.add( 'is-open' );
			}
		}

		function closeDesktopToc() {
			if ( toc ) {
				toc.classList.remove( 'is-open' );
			}
		}
	}

	/**
	 * Set up scroll spy using Intersection Observer - optimized
	 */
	function setupScrollSpy( tocLinks, tocWrapper ) {
		// Get all heading IDs - sanitized
		const headingIds = tocLinks
			.map( function( link ) {
				const href = link.getAttribute( 'href' );
				if ( ! href || ! href.startsWith( '#' ) ) {
					return null;
				}
				return sanitizeId( href.substring( 1 ) );
			} )
			.filter( function( id ) {
				return id !== null;
			} );

		if ( headingIds.length === 0 ) {
			return;
		}

		// Get all heading elements - validate they exist in DOM
		const headings = headingIds
			.map( function( id ) {
				const el = document.getElementById( id );
				// Security: verify element is in document
				return el && document.body.contains( el ) ? el : null;
			} )
			.filter( function( el ) {
				return el !== null;
			} );

		if ( headings.length === 0 ) {
			return;
		}

		// Create Intersection Observer
		const observerOptions = {
			rootMargin: '-20% 0px -35% 0px',
			threshold: 0
		};

		let rafId = null;

		const observer = new IntersectionObserver( function( entries ) {
			// Batch updates with requestAnimationFrame
			if ( rafId ) {
				cancelAnimationFrame( rafId );
			}
			
			rafId = requestAnimationFrame( function() {
				entries.forEach( function( entry ) {
					if ( entry.isIntersecting ) {
						const headingId = sanitizeId( entry.target.id );
						if ( headingId ) {
							updateActiveLink( headingId, tocLinks );
							scrollTocToActiveLink( headingId, tocLinks, tocWrapper );
						}
					}
				} );
			} );
		}, observerOptions );

		// Observe all headings
		headings.forEach( function( heading ) {
			if ( document.body.contains( heading ) ) {
				observer.observe( heading );
			}
		} );

		// Initial active state
		const initialActiveId = getActiveHeadingId( headings );
		if ( initialActiveId ) {
			updateActiveLink( initialActiveId, tocLinks );
			scrollTocToActiveLink( initialActiveId, tocLinks, tocWrapper );
		}

		// Cleanup on page unload
		window.addEventListener( 'beforeunload', function() {
			if ( rafId ) {
				cancelAnimationFrame( rafId );
			}
			observer.disconnect();
		}, { passive: true } );
	}

	/**
	 * Update active link in TOC
	 */
	function updateActiveLink( activeId, tocLinks ) {
		if ( ! activeId ) {
			return;
		}
		
		tocLinks.forEach( function( link ) {
			const href = link.getAttribute( 'href' );
			if ( ! href || ! href.startsWith( '#' ) ) {
				return;
			}
			
			const linkId = sanitizeId( href.substring( 1 ) );
			if ( ! linkId ) {
				return;
			}
			
			if ( linkId === activeId ) {
				link.classList.add( 'is-active' );
			} else {
				link.classList.remove( 'is-active' );
			}
		} );
	}

	/**
	 * Scroll TOC content to keep active link visible - optimized
	 */
	function scrollTocToActiveLink( activeId, tocLinks, tocWrapper ) {
		if ( ! activeId || ! tocWrapper ) {
			return;
		}
		
		const activeLink = tocLinks.find( function( link ) {
			const href = link.getAttribute( 'href' );
			if ( ! href || ! href.startsWith( '#' ) ) {
				return false;
			}
			const linkId = sanitizeId( href.substring( 1 ) );
			return linkId === activeId;
		} );

		if ( ! activeLink || ! document.body.contains( activeLink ) ) {
			return;
		}

		const toc = tocWrapper.querySelector( '.navygator-toc' );
		if ( ! toc || ! document.body.contains( toc ) ) {
			return;
		}

		// Use requestAnimationFrame for smooth scrolling
		requestAnimationFrame( function() {
			const tocRect = toc.getBoundingClientRect();
			const linkRect = activeLink.getBoundingClientRect();
			
			const linkTop = linkRect.top - tocRect.top;
			const linkBottom = linkRect.bottom - tocRect.top;
			const tocHeight = tocRect.height;
			
			// Only scroll if link is not visible
			if ( linkTop < 0 || linkBottom > tocHeight ) {
				const linkOffset = activeLink.offsetTop;
				const tocCenter = tocHeight / 2;
				const linkHeight = linkRect.height;
				const targetScrollTop = linkOffset - tocCenter + ( linkHeight / 2 );
				
				toc.scrollTo( {
					top: Math.max( 0, targetScrollTop ),
					behavior: 'smooth'
				} );
			}
		} );
	}

	/**
	 * Get the currently active heading ID based on scroll position
	 */
	function getActiveHeadingId( headings ) {
		if ( ! headings || headings.length === 0 ) {
			return null;
		}
		
		const scrollPosition = window.scrollY + 100;

		for ( let i = headings.length - 1; i >= 0; i-- ) {
			const heading = headings[ i ];
			if ( heading && document.body.contains( heading ) && heading.offsetTop <= scrollPosition ) {
				return sanitizeId( heading.id );
			}
		}

		return headings[ 0 ] && document.body.contains( headings[ 0 ] ) ? sanitizeId( headings[ 0 ].id ) : null;
	}

} )();

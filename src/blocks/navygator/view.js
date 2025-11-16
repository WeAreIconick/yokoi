/**
 * NavyGator Table of Contents - Frontend JavaScript
 * 
 * Handles:
 * - Mobile toggle functionality
 * - Scroll spy (active section highlighting)
 * - Smooth scrolling
 * - Drawer open/close
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

	// Debounce function for performance
	function debounce( func, wait ) {
		let timeout;
		return function executedFunction( ...args ) {
			const later = () => {
				clearTimeout( timeout );
				func( ...args );
			};
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
		};
	}

	// Validate and sanitize ID
	function sanitizeId( id ) {
		if ( ! id || typeof id !== 'string' ) {
			return null;
		}
		// Only allow alphanumeric, hyphens, and underscores
		return id.replace( /[^a-zA-Z0-9_-]/g, '' );
	}

	// Wait for DOM to be ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	function init() {
		const tocWrapper = document.querySelector( '.navygator-toc-wrapper' );
		
		if ( ! tocWrapper || ! document.body.contains( tocWrapper ) ) {
			return;
		}

		const toc = tocWrapper.querySelector( '.navygator-toc' );
		const toggleBtn = tocWrapper.querySelector( '.navygator-toc-toggle' );
		const closeBtn = tocWrapper.querySelector( '.navygator-toc-close' );
		const backdrop = tocWrapper.querySelector( '.navygator-toc-backdrop' );
		const tocLinks = tocWrapper.querySelectorAll( '.navygator-toc-link' );

		// Toggle functionality for both mobile and desktop
		if ( toggleBtn ) {
			toggleBtn.addEventListener( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				if ( window.innerWidth <= 768 ) {
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
				if ( window.innerWidth <= 768 ) {
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

		// Close on escape key - debounced for performance
		const handleEscape = debounce( function( e ) {
			if ( e.key === 'Escape' && toc && toc.classList.contains( 'is-open' ) ) {
				if ( window.innerWidth <= 768 ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}
			}
		}, 100 );
		
		document.addEventListener( 'keydown', handleEscape, { passive: true } );

		// Smooth scroll and close on link click
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
				if ( ! targetElement || ! document.body.contains( targetElement ) ) {
					return;
				}

				// Close TOC on mobile
				if ( window.innerWidth <= 768 ) {
					closeDrawer();
				} else {
					// On desktop, close TOC after clicking a link
					closeDesktopToc();
				}

				// Smooth scroll to target using requestAnimationFrame for better performance
				requestAnimationFrame( () => {
					const yOffset = -20; // Offset for fixed headers
					const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

					window.scrollTo( {
						top: y,
						behavior: 'smooth'
					} );

					// Update URL hash without jumping
					if ( history.pushState ) {
						history.pushState( null, null, '#' + targetId );
					}
				} );
			}, { passive: true } );
		} );

		// Scroll spy - highlight active section
		setupScrollSpy( tocLinks );

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
				
				// Smooth animation using CSS transitions
				toc.style.setProperty('opacity', '1', 'important');
				toc.style.setProperty('visibility', 'visible', 'important');
				toc.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
				toc.style.setProperty('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
				
				// Add backdrop with fade-in animation
				if ( backdrop ) {
					backdrop.style.setProperty('opacity', '1', 'important');
					backdrop.style.setProperty('visibility', 'visible', 'important');
					backdrop.style.setProperty('transition', 'all 0.3s ease', 'important');
				}
			}
		}

		function closeDesktopToc() {
			if ( toc ) {
				toc.classList.remove( 'is-open' );
				
				// Smooth animation using CSS transitions
				toc.style.setProperty('opacity', '0', 'important');
				toc.style.setProperty('visibility', 'hidden', 'important');
				toc.style.setProperty('transform', 'translateY(-10px) scale(0.95)', 'important');
				toc.style.setProperty('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
				
				// Hide backdrop with fade-out animation
				if ( backdrop ) {
					backdrop.style.setProperty('opacity', '0', 'important');
					backdrop.style.setProperty('visibility', 'hidden', 'important');
					backdrop.style.setProperty('transition', 'all 0.3s ease', 'important');
				}
			}
		}
	}

	/**
	 * Set up scroll spy using Intersection Observer
	 */
	function setupScrollSpy( tocLinks ) {
		// Get all heading IDs from TOC links - sanitized
		const headingIds = Array.from( tocLinks )
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

		// Get all heading elements - validate they exist in DOM
		const headings = headingIds
			.map( function( id ) {
				const el = document.getElementById( id );
				return el && document.body.contains( el ) ? el : null;
			} )
			.filter( function( el ) {
				return el !== null;
			} );

		if ( headings.length === 0 ) {
			return;
		}

		// Create Intersection Observer with performance optimizations
		const observerOptions = {
			rootMargin: '-20% 0px -35% 0px',
			threshold: 0
		};

		let activeHeading = null;
		let rafId = null;

		const observer = new IntersectionObserver( function( entries ) {
			// Use requestAnimationFrame to batch updates
			if ( rafId ) {
				cancelAnimationFrame( rafId );
			}
			
			rafId = requestAnimationFrame( function() {
				entries.forEach( function( entry ) {
					if ( entry.isIntersecting ) {
						activeHeading = entry.target;
						const headingId = sanitizeId( entry.target.id );
						if ( headingId ) {
							updateActiveLink( headingId, tocLinks );
							scrollTocToActiveLink( headingId, tocLinks );
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

		// Initial active state based on scroll position
		const initialActiveId = getActiveHeadingId( headings );
		if ( initialActiveId ) {
			updateActiveLink( initialActiveId, tocLinks );
			scrollTocToActiveLink( initialActiveId, tocLinks );
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
	 * Scroll TOC content to keep active link visible
	 */
	function scrollTocToActiveLink( activeId, tocLinks ) {
		if ( ! activeId ) {
			return;
		}
		
		const activeLink = Array.from( tocLinks ).find( function( link ) {
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

		const toc = document.querySelector( '.navygator-toc' );
		if ( ! toc || ! document.body.contains( toc ) ) {
			return;
		}

		// Use requestAnimationFrame for smooth scrolling
		requestAnimationFrame( function() {
			// Get the position of the active link relative to the TOC container
			const tocRect = toc.getBoundingClientRect();
			const linkRect = activeLink.getBoundingClientRect();
			
			// Calculate if the link is visible within the TOC container
			const linkTop = linkRect.top - tocRect.top;
			const linkBottom = linkRect.bottom - tocRect.top;
			const tocHeight = tocRect.height;
			
			// If the link is not fully visible, scroll to center it
			if ( linkTop < 0 || linkBottom > tocHeight ) {
				const linkOffset = activeLink.offsetTop;
				const tocCenter = tocHeight / 2;
				const linkHeight = linkRect.height;
				
				// Calculate the ideal scroll position to center the link
				const targetScrollTop = linkOffset - tocCenter + ( linkHeight / 2 );
				
				// Smooth scroll to the target position
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


/**
 * NavyGator Table of Contents - Frontend JavaScript
 * 
 * Handles:
 * - Mobile toggle functionality
 * - Scroll spy (active section highlighting)
 * - Smooth scrolling
 * - Drawer open/close
 */

( function() {
	'use strict';

	// Prevent duplicate execution
	if ( window.navygatorInitialized ) {
		return;
	}
	window.navygatorInitialized = true;

	// Wait for DOM to be ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	function init() {
		const tocWrapper = document.querySelector( '.navygator-toc-wrapper' );
		
		if ( ! tocWrapper ) {
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
				if ( window.innerWidth <= 768 ) {
					openDrawer();
				} else {
					toggleDesktopToc();
				}
			});
		}

		if ( closeBtn ) {
			closeBtn.addEventListener( 'click', function() {
				if ( window.innerWidth <= 768 ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}
			});
		}

		if ( backdrop ) {
			backdrop.addEventListener( 'click', closeDrawer );
		}

		// Close on escape key
		document.addEventListener( 'keydown', function( e ) {
			if ( e.key === 'Escape' && toc && toc.classList.contains( 'is-open' ) ) {
				if ( window.innerWidth <= 768 ) {
					closeDrawer();
				} else {
					closeDesktopToc();
				}
			}
		} );

		// Smooth scroll and close on link click
		tocLinks.forEach( function( link ) {
			link.addEventListener( 'click', function( e ) {
				e.preventDefault();
				
				const targetId = this.getAttribute( 'href' ).substring( 1 );
				const targetElement = document.getElementById( targetId );

				if ( targetElement ) {
					// Close TOC on mobile
					if ( window.innerWidth <= 768 ) {
						closeDrawer();
					} else {
						// On desktop, close TOC after clicking a link
						closeDesktopToc();
					}

					// Smooth scroll to target
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
				}
			} );
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
		// Get all heading IDs from TOC links
		const headingIds = Array.from( tocLinks ).map( function( link ) {
			return link.getAttribute( 'href' ).substring( 1 );
		} );

		// Get all heading elements
		const headings = headingIds
			.map( function( id ) {
				return document.getElementById( id );
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

		let activeHeading = null;

		const observer = new IntersectionObserver( function( entries ) {
			entries.forEach( function( entry ) {
				if ( entry.isIntersecting ) {
					activeHeading = entry.target;
					updateActiveLink( entry.target.id, tocLinks );
					scrollTocToActiveLink( entry.target.id, tocLinks );
				}
			} );
		}, observerOptions );

		// Observe all headings
		headings.forEach( function( heading ) {
			observer.observe( heading );
		} );

		// Initial active state based on scroll position
		const initialActiveId = getActiveHeadingId( headings );
		updateActiveLink( initialActiveId, tocLinks );
		scrollTocToActiveLink( initialActiveId, tocLinks );
	}

	/**
	 * Update active link in TOC
	 */
	function updateActiveLink( activeId, tocLinks ) {
		tocLinks.forEach( function( link ) {
			const linkId = link.getAttribute( 'href' ).substring( 1 );
			
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
		const activeLink = Array.from( tocLinks ).find( function( link ) {
			return link.getAttribute( 'href' ).substring( 1 ) === activeId;
		} );

		if ( ! activeLink ) {
			return;
		}

		const toc = document.querySelector( '.navygator-toc' );
		if ( ! toc ) {
			return;
		}

		// Get the position of the active link relative to the TOC container
		const tocRect = toc.getBoundingClientRect();
		const linkRect = activeLink.getBoundingClientRect();
		
		// Calculate if the link is visible within the TOC container
		const linkTop = linkRect.top - tocRect.top;
		const linkBottom = linkRect.bottom - tocRect.top;
		const tocHeight = tocRect.height;
		
		// If the link is not fully visible, scroll to center it
		if ( linkTop < 0 || linkBottom > tocHeight ) {
			const scrollTop = toc.scrollTop;
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
	}

	/**
	 * Get the currently active heading ID based on scroll position
	 */
	function getActiveHeadingId( headings ) {
		const scrollPosition = window.scrollY + 100;

		for ( let i = headings.length - 1; i >= 0; i-- ) {
			const heading = headings[ i ];
			if ( heading.offsetTop <= scrollPosition ) {
				return heading.id;
			}
		}

		return headings[ 0 ] ? headings[ 0 ].id : null;
	}

} )();


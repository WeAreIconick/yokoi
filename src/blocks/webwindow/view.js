const initializeWebWindowBlocks = () => {
	const IDEAL_SITE_WIDTH = 1440;
	const IDEAL_SITE_HEIGHT = 900;
	const blocks = document.querySelectorAll(
		'.wp-block-yokoi-webwindow[data-src]'
	);

	if ( ! blocks.length ) {
		return;
	}

	const updateScaleAndHeight = ( iframe, container ) => {
		if ( ! iframe || ! container ) {
			return;
		}

		const parentWidth = container.offsetWidth || 600;
		const scale = Math.min( 1, parentWidth / IDEAL_SITE_WIDTH );
		iframe.style.transform = `scale(${ scale })`;
		iframe.style.transformOrigin = 'top left';
		container.style.height = `${ IDEAL_SITE_HEIGHT * scale }px`;
		iframe.style.display = 'block';
		iframe.style.overflow = 'hidden';
	};

	blocks.forEach( ( block ) => {
		const src = block.getAttribute( 'data-src' );
		const scaleToFit = block.getAttribute( 'data-scale-to-fit' ) === '1';

		if ( ! src || block.querySelector( '.webwindow-js-iframe' ) ) {
			return;
		}

		const outer = block.querySelector( '.webwindow-block-embed' );
		const iframeContainer =
			block.querySelector( '.webwindow-iframe-outer' ) || outer;

		if ( ! outer || ! iframeContainer ) {
			return;
		}

		const iframe = document.createElement( 'iframe' );
		iframe.className = 'webwindow-js-iframe';
		iframe.title = 'Embedded Web Page';
		iframe.src = src;
		iframe.sandbox =
			'allow-scripts allow-forms allow-same-origin allow-popups';

		iframe.onerror = () => {
			const warning = document.createElement( 'div' );
			warning.className = 'webwindow-notice';
			warning.style.background = '#fffbe5';
			warning.style.borderLeft = '4px solid #ffb900';
			warning.style.margin = '8px 0';
			warning.style.padding = '8px 12px';
			warning.style.fontSize = '0.95em';
			warning.innerText =
				'Could not display this page (site does not allow embedding, or it is unavailable).';
			outer.appendChild( warning );
			setTimeout( () => {
				if ( warning.parentNode ) {
					warning.parentNode.removeChild( warning );
				}
			}, 3500 );
		};

		if ( scaleToFit ) {
			iframe.style.width = `${ IDEAL_SITE_WIDTH }px`;
			iframe.style.height = `${ IDEAL_SITE_HEIGHT }px`;
			iframe.style.border = '1px solid #ddd';
			iframe.style.display = 'block';
			iframe.style.overflow = 'hidden';
			setTimeout( () => {
				updateScaleAndHeight( iframe, iframeContainer );
			}, 16 );
		} else {
			iframe.style.width = '100%';
			iframe.style.minHeight = '400px';
			iframe.style.border = '1px solid #ddd';
			iframe.style.overflow = 'auto';
		}

		iframeContainer.appendChild( iframe );

		if ( scaleToFit ) {
			const resizeHandler = () => {
				if ( document.body.contains( iframe ) ) {
					updateScaleAndHeight( iframe, iframeContainer );
				} else {
					window.removeEventListener( 'resize', resizeHandler );
				}
			};
			window.addEventListener( 'resize', resizeHandler );
		}
	} );
};

document.addEventListener( 'DOMContentLoaded', initializeWebWindowBlocks );


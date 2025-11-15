import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

const IDEAL_SITE_WIDTH = 1440;
const IDEAL_SITE_HEIGHT = 900;

const WebWindowEdit = ( { attributes, setAttributes } ) => {
	const { src, scaleToFit } = attributes;
	const [ hasError, setHasError ] = useState( false );
	const iframeRef = useRef( null );
	const wrapperRef = useRef( null );
	const [ scale, setScale ] = useState( 1 );
	const [ scaledHeight, setScaledHeight ] = useState( IDEAL_SITE_HEIGHT );

	useEffect( () => {
		if ( ! scaleToFit ) {
			setScale( 1 );
			setScaledHeight( IDEAL_SITE_HEIGHT );
			return;
		}

		const updateScale = () => {
			if ( ! wrapperRef.current ) {
				return;
			}
			const parentWidth = wrapperRef.current.offsetWidth || 600;
			const nextScale = Math.min( 1, parentWidth / IDEAL_SITE_WIDTH );
			setScale( nextScale );
			setScaledHeight( Math.round( IDEAL_SITE_HEIGHT * nextScale ) );
		};

		updateScale();
		window.addEventListener( 'resize', updateScale );

		return () => {
			window.removeEventListener( 'resize', updateScale );
		};
	}, [ scaleToFit ] );

	const handleIframeError = () => {
		setHasError( true );
	};

	const iframeStyles = scaleToFit
		? {
				width: `${ IDEAL_SITE_WIDTH }px`,
				height: `${ IDEAL_SITE_HEIGHT }px`,
				border: hasError ? '2px solid #f00' : '1px solid #ddd',
				background: '#fff',
				transform: `scale(${ scale })`,
				transformOrigin: 'top left',
				display: 'block',
				overflow: 'hidden',
		  }
		: {
				width: '100%',
				minHeight: 400,
				border: hasError ? '2px solid #f00' : '1px solid #ddd',
				background: '#fff',
				display: 'block',
				overflow: 'auto',
		  };

	const frameContainerStyles = scaleToFit
		? {
				width: '100%',
				height: `${ scaledHeight }px`,
				maxWidth: '100%',
				overflow: 'hidden',
				position: 'relative',
				background: '#fff',
		  }
		: {};

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody
					title={ __( 'WebWindow Settings', 'yokoi' ) }
					initialOpen={ true }
				>
					<TextControl
						type="url"
						label={ __( 'Webpage URL', 'yokoi' ) }
						value={ src }
						onChange={ ( value ) => setAttributes( { src: value } ) }
						placeholder="https://iconick.io"
					/>
					<ToggleControl
						label={ __(
							'Scale to fit (show the full site at once)',
							'yokoi'
						) }
						checked={ scaleToFit }
						onChange={ ( value ) =>
							setAttributes( { scaleToFit: value } )
						}
						help={ __(
							'Zooms out the embedded page so more of the full site is visible. This may reduce readability or interactivity.',
							'yokoi'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div
				className="webwindow-block-embed browser-frame"
				ref={ wrapperRef }
			>
				<div className="browser-frame-bar">
					<span className="browser-frame-dot red" />
					<span className="browser-frame-dot yellow" />
					<span className="browser-frame-dot green" />
					<span className="browser-frame-url">{ src || '' }</span>
					{ src ? (
						<a
							href={ src }
							className="browser-frame-open-button"
							target="_blank"
							rel="noopener noreferrer"
							title={ __(
								'Open full site in a new tab',
								'yokoi'
							) }
							onClick={ ( e ) => {
								e.preventDefault();
								window.open(
									src,
									'_blank',
									'noopener,noreferrer'
								);
							} }
						>
							&#8599;
						</a>
					) : null }
				</div>
				<div
					className="webwindow-iframe-outer"
					style={ frameContainerStyles }
				>
					{ src ? (
						<iframe
							ref={ iframeRef }
							title={ __( 'Embedded web page', 'yokoi' ) }
							src={ src }
							onError={ handleIframeError }
							style={ iframeStyles }
							sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-orientation-lock allow-modals"
							allow="autoplay; encrypted-media; fullscreen; clipboard-write; accelerometer; gyroscope; web-share"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					) : null }
				</div>
				{ src && hasError ? (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'This site refused to be embedded or is currently unavailable.',
							'yokoi'
						) }
					</Notice>
				) : null }
				{ ! src ? (
					<div className="webwindow-block-empty" />
				) : null }
			</div>
		</div>
	);
};

export default WebWindowEdit;


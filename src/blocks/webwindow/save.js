import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * WebWindow Save Component
 * Secure rendering with proper URL sanitization
 */
const WebWindowSave = ( { attributes } ) => {
	const { src, scaleToFit } = attributes;

	// Sanitize URL for security - only allow http/https
	const sanitizedSrc = src && ( src.startsWith( 'http://' ) || src.startsWith( 'https://' ) )
		? src
		: '';

	return (
		<div
			{ ...useBlockProps.save() }
			data-src={ sanitizedSrc }
			data-scale-to-fit={ scaleToFit ? '1' : '0' }
		>
			<div className="webwindow-block-embed browser-frame">
				<div className="browser-frame-bar">
					<span className="browser-frame-dot red" />
					<span className="browser-frame-dot yellow" />
					<span className="browser-frame-dot green" />
					<span className="browser-frame-url">{ sanitizedSrc || '' }</span>
					{ sanitizedSrc ? (
						<a
							href={ sanitizedSrc }
							className="browser-frame-open-button"
							target="_blank"
							rel="noopener noreferrer"
							title={ __(
								'Open full site in a new tab',
								'yokoi'
							) }
						>
							&#8599;
						</a>
					) : null }
				</div>
				<noscript>
					{ sanitizedSrc ? (
						<iframe
							title={ __(
								'Embedded web page (noscript fallback)',
								'yokoi'
							) }
							src={ sanitizedSrc }
							style={ {
								width: '100%',
								minHeight: 400,
								border: '1px solid #ccc',
							} }
							sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					) : null }
				</noscript>
				<div className="webwindow-iframe-outer" />
				{ ! sanitizedSrc ? <div className="webwindow-block-empty" /> : null }
			</div>
		</div>
	);
};

export default WebWindowSave;


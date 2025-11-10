import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const WebWindowSave = ( { attributes } ) => {
	const { src, scaleToFit } = attributes;

	return (
		<div
			{ ...useBlockProps.save() }
			data-src={ src }
			data-scale-to-fit={ scaleToFit ? '1' : '0' }
		>
			<div className="webwindow-block-embed browser-frame">
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
						>
							&#8599;
						</a>
					) : null }
				</div>
				<noscript>
					{ src ? (
						<iframe
							title={ __(
								'Embedded web page (noscript fallback)',
								'yokoi'
							) }
							src={ src }
							style={ {
								width: '100%',
								minHeight: 400,
								border: '1px solid #ccc',
							} }
							sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
						/>
					) : null }
				</noscript>
				<div className="webwindow-iframe-outer" />
				{ ! src ? <div className="webwindow-block-empty" /> : null }
			</div>
		</div>
	);
};

export default WebWindowSave;


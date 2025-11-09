/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import {
	useBlockProps,
	InspectorControls,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
	TextControl,
	CheckboxControl,
	ToolbarGroup,
	ToolbarButton,
	ExternalLink,
} from '@wordpress/components';

import { useState, useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/* eslint-disable jsdoc/check-line-alignment */
/**
 * Edit component for the Poppit block.
 *
 * @param {Object} props Component props.
 * @param {Object} props.attributes Block attributes.
 * @param {Function} props.setAttributes Setter that updates attributes.
 * @return {JSX.Element} Element to render.
 */
/* eslint-enable jsdoc/check-line-alignment */
export default function Edit( { attributes, setAttributes } ) {
	const {
		popupType,
		title,
		content,
		triggerType,
		triggerDelay,
		scrollDepth,
		exitIntent,
		showCloseButton,
		overlayOpacity,
		emailEnabled,
		emailPlaceholder,
		buttonText,
		targeting,
		animation,
		width,
		height,
		position,
		allowReset,
		resetDelay,
	} = attributes;

	const [ previewMode, setPreviewMode ] = useState( false );

	// Generate unique popup ID if not exists
	useEffect( () => {
		if ( ! attributes.popupId ) {
			setAttributes( {
				popupId: `popup-${ Math.random()
					.toString( 36 )
					.slice( 2, 11 ) }`,
			} );
		}
	}, [ attributes.popupId, setAttributes ] );

	const blockProps = useBlockProps( {
		className: `poppit-block popup-type-${ popupType } position-${ position }`,
		style: {
			'--popup-width': width,
			'--popup-height': height,
			'--overlay-opacity': overlayOpacity,
		},
	} );

	const popupTypeOptions = [
		{ label: __( 'Modal/Lightbox', 'yokoi' ), value: 'modal' },
		{ label: __( 'Slide In', 'yokoi' ), value: 'slide' },
		{ label: __( 'Top Bar', 'yokoi' ), value: 'topbar' },
		{ label: __( 'Bottom Bar', 'yokoi' ), value: 'bottombar' },
		{ label: __( 'Full Screen', 'yokoi' ), value: 'fullscreen' },
	];

	const triggerTypeOptions = [
		{ label: __( 'Time Based', 'yokoi' ), value: 'time' },
		{ label: __( 'Scroll Depth', 'yokoi' ), value: 'scroll' },
		{ label: __( 'Exit Intent', 'yokoi' ), value: 'exit' },
		{ label: __( 'Page Load', 'yokoi' ), value: 'load' },
		{ label: __( 'Manual Trigger', 'yokoi' ), value: 'manual' },
	];

	const animationOptions = [
		{ label: __( 'Fade In', 'yokoi' ), value: 'fadeIn' },
		{ label: __( 'Slide Down', 'yokoi' ), value: 'slideDown' },
		{ label: __( 'Slide Up', 'yokoi' ), value: 'slideUp' },
		{ label: __( 'Zoom In', 'yokoi' ), value: 'zoomIn' },
		{ label: __( 'Bounce In', 'yokoi' ), value: 'bounceIn' },
	];

	const positionOptions = [
		{ label: __( 'Center', 'yokoi' ), value: 'center' },
		{ label: __( 'Top Left', 'yokoi' ), value: 'top-left' },
		{ label: __( 'Top Right', 'yokoi' ), value: 'top-right' },
		{ label: __( 'Bottom Left', 'yokoi' ), value: 'bottom-left' },
		{ label: __( 'Bottom Right', 'yokoi' ), value: 'bottom-right' },
	];

	const renderPopupPreview = () => {
		return (
			<div className="poppit-preview">
				<div
					className="popup-overlay"
					style={ { opacity: overlayOpacity } }
				>
					<div
						className={ `popup-container popup-${ popupType } animation-${ animation }` }
					>
						{ showCloseButton && (
							<button
								className="popup-close"
								aria-label={ __( 'Close', 'yokoi' ) }
							>
								×
							</button>
						) }

						<div className="popup-content">
							<RichText
								tagName="h3"
								className="popup-title"
								value={ title }
								onChange={ ( value ) =>
									setAttributes( { title: value } )
								}
								placeholder={ __(
									'Enter popup title…',
									'yokoi'
								) }
							/>

							<RichText
								tagName="div"
								className="popup-text"
								value={ content }
								onChange={ ( value ) =>
									setAttributes( { content: value } )
								}
								placeholder={ __(
									'Enter popup content…',
									'yokoi'
								) }
							/>

							{ emailEnabled && (
								<div className="popup-email-form">
									<input
										type="email"
										placeholder={ emailPlaceholder }
										className="popup-email-input"
									/>
									<button className="popup-submit-btn">
										{ buttonText }
									</button>
								</div>
							) }
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderEditorView = () => {
		return (
			<div className="poppit-editor">
				<div className="poppit-header">
					<h4>{ __( 'Poppit', 'yokoi' ) }</h4>
					<div className="poppit-meta">
						<span className="popup-type-badge">
							{ popupType.toUpperCase() }
						</span>
						<span className="trigger-type-badge">
							{ triggerType === 'time' &&
								sprintf(
									/* translators: %s: Seconds before the popup is shown. */
									__( 'After %ss', 'yokoi' ),
									triggerDelay
								) }
							{ triggerType === 'scroll' &&
								sprintf(
									/* translators: %s: Percentage of scroll depth. */
									__( 'At %s%%', 'yokoi' ),
									scrollDepth
								) }
							{ triggerType === 'exit' &&
								__( 'Exit Intent', 'yokoi' ) }
							{ triggerType === 'load' &&
								__( 'Page Load', 'yokoi' ) }
							{ triggerType === 'manual' &&
								__( 'Manual', 'yokoi' ) }
						</span>
						{ allowReset && (
							<span className="reset-badge">
								{ __( 'RESETS', 'yokoi' ) }
							</span>
						) }
					</div>
				</div>

				<div className="poppit-preview-container">
					{ renderPopupPreview() }
				</div>
			</div>
		);
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={
							previewMode
								? __( 'Edit Mode', 'yokoi' )
								: __( 'Preview Mode', 'yokoi' )
						}
						onClick={ () => setPreviewMode( ! previewMode ) }
						isPressed={ previewMode }
					>
						{ previewMode ? '⚙️' : '👁️' }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Pop-up Settings', 'yokoi' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Pop-up Type', 'yokoi' ) }
						value={ popupType }
						options={ popupTypeOptions }
						onChange={ ( value ) =>
							setAttributes( { popupType: value } )
						}
					/>

					<SelectControl
						label={ __( 'Animation', 'yokoi' ) }
						value={ animation }
						options={ animationOptions }
						onChange={ ( value ) =>
							setAttributes( { animation: value } )
						}
					/>

					{ popupType === 'modal' && (
						<SelectControl
							label={ __( 'Position', 'yokoi' ) }
							value={ position }
							options={ positionOptions }
							onChange={ ( value ) =>
								setAttributes( { position: value } )
							}
						/>
					) }

					<TextControl
						label={ __( 'Width', 'yokoi' ) }
						value={ width }
						onChange={ ( value ) =>
							setAttributes( { width: value } )
						}
						help={ __( 'e.g., 500px, 80%, auto', 'yokoi' ) }
					/>

					<ToggleControl
						label={ __( 'Show Close Button', 'yokoi' ) }
						checked={ showCloseButton }
						onChange={ ( value ) =>
							setAttributes( { showCloseButton: value } )
						}
					/>

					<RangeControl
						label={ __( 'Overlay Opacity', 'yokoi' ) }
						value={ overlayOpacity }
						onChange={ ( value ) =>
							setAttributes( { overlayOpacity: value } )
						}
						min={ 0 }
						max={ 1 }
						step={ 0.1 }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Trigger Settings', 'yokoi' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Trigger Type', 'yokoi' ) }
						value={ triggerType }
						options={ triggerTypeOptions }
						onChange={ ( value ) =>
							setAttributes( { triggerType: value } )
						}
					/>

					{ triggerType === 'time' && (
						<RangeControl
							label={ __( 'Delay (seconds)', 'yokoi' ) }
							value={ triggerDelay }
							onChange={ ( value ) =>
								setAttributes( { triggerDelay: value } )
							}
							min={ 0 }
							max={ 60 }
							step={ 1 }
						/>
					) }

					{ triggerType === 'scroll' && (
						<RangeControl
							label={ __( 'Scroll Depth (%)', 'yokoi' ) }
							value={ scrollDepth }
							onChange={ ( value ) =>
								setAttributes( { scrollDepth: value } )
							}
							min={ 0 }
							max={ 100 }
							step={ 5 }
						/>
					) }

					{ triggerType === 'exit' && (
						<ToggleControl
							label={ __( 'Enable Exit Intent', 'yokoi' ) }
							checked={ exitIntent }
							onChange={ ( value ) =>
								setAttributes( { exitIntent: value } )
							}
							help={ __(
								'Show popup when user moves cursor to leave the page',
								'yokoi'
							) }
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Reset Behavior', 'yokoi' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Allow Reset', 'yokoi' ) }
						checked={ allowReset }
						onChange={ ( value ) =>
							setAttributes( { allowReset: value } )
						}
						help={ __(
							'Allow the popup to be shown again after a specified delay',
							'yokoi'
						) }
					/>

					{ allowReset && (
						<>
							<RangeControl
								label={ __( 'Reset Delay (minutes)', 'yokoi' ) }
								value={ resetDelay || 60 }
								onChange={ ( value ) =>
									setAttributes( { resetDelay: value } )
								}
								min={ 1 }
								max={ 1440 }
								step={ 1 }
								help={ __(
									'Time in minutes before the popup can be shown again',
									'yokoi'
								) }
							/>

							<div
								style={ {
									marginTop: '15px',
									padding: '12px',
									backgroundColor: '#f0f6fc',
									border: '1px solid #c3e4f7',
									borderRadius: '4px',
									fontSize: '13px',
								} }
							>
								<strong>
									{ __( 'Testing Options:', 'yokoi' ) }
								</strong>
								<p
									style={ {
										margin: '5px 0 0 0',
										lineHeight: '1.4',
									} }
								>
									{ __(
										'Add ?poppit-test=1 to your URL to ignore all display restrictions for testing.',
										'yokoi'
									) }
								</p>
							</div>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Email Integration', 'yokoi' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Enable Email Collection', 'yokoi' ) }
						checked={ emailEnabled }
						onChange={ ( value ) =>
							setAttributes( { emailEnabled: value } )
						}
					/>

					{ emailEnabled && (
						<>
							<TextControl
								label={ __( 'Email Placeholder', 'yokoi' ) }
								value={ emailPlaceholder }
								onChange={ ( value ) =>
									setAttributes( { emailPlaceholder: value } )
								}
							/>

							<TextControl
								label={ __( 'Button Text', 'yokoi' ) }
								value={ buttonText }
								onChange={ ( value ) =>
									setAttributes( { buttonText: value } )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Targeting Options', 'yokoi' ) }
					initialOpen={ false }
				>
					<h4>{ __( 'Device Targeting', 'yokoi' ) }</h4>
					<CheckboxControl
						label={ __( 'Desktop', 'yokoi' ) }
						checked={ targeting.devices.includes( 'desktop' ) }
						onChange={ ( checked ) => {
							const devices = checked
								? [ ...targeting.devices, 'desktop' ]
								: targeting.devices.filter(
										( d ) => d !== 'desktop'
								  );
							setAttributes( {
								targeting: { ...targeting, devices },
							} );
						} }
					/>
					<CheckboxControl
						label={ __( 'Tablet', 'yokoi' ) }
						checked={ targeting.devices.includes( 'tablet' ) }
						onChange={ ( checked ) => {
							const devices = checked
								? [ ...targeting.devices, 'tablet' ]
								: targeting.devices.filter(
										( d ) => d !== 'tablet'
								  );
							setAttributes( {
								targeting: { ...targeting, devices },
							} );
						} }
					/>
					<CheckboxControl
						label={ __( 'Mobile', 'yokoi' ) }
						checked={ targeting.devices.includes( 'mobile' ) }
						onChange={ ( checked ) => {
							const devices = checked
								? [ ...targeting.devices, 'mobile' ]
								: targeting.devices.filter(
										( d ) => d !== 'mobile'
								  );
							setAttributes( {
								targeting: { ...targeting, devices },
							} );
						} }
					/>

					<SelectControl
						label={ __( 'User Type', 'yokoi' ) }
						value={ targeting.userType }
						options={ [
							{
								label: __( 'All Visitors', 'yokoi' ),
								value: 'all',
							},
							{
								label: __( 'New Visitors', 'yokoi' ),
								value: 'new',
							},
							{
								label: __( 'Returning Visitors', 'yokoi' ),
								value: 'returning',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( {
								targeting: { ...targeting, userType: value },
							} )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'More Blocks by iconick', 'yokoi' ) }
					initialOpen={ false }
				>
					<p>
						{ __(
							"Think these ideas are wild? You ain't seen nothing yet.",
							'yokoi'
						) }
					</p>
					<ExternalLink href="https://iconick.io/blocks/">
						{ __( 'Click to enter the block wonderland', 'yokoi' ) }
					</ExternalLink>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ previewMode ? renderPopupPreview() : renderEditorView() }
			</div>
		</>
	);
}

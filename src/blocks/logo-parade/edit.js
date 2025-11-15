import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	withColors,
} from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	ColorPalette,
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { trash, arrowUp, arrowDown } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

import './editor.scss';

const ensureLogos = ( logos = [] ) =>
	Array.isArray( logos ) ? logos : [];

const filterValidLogos = ( logos ) =>
	ensureLogos( logos ).filter(
		( logo ) =>
			logo &&
			typeof logo === 'object' &&
			typeof logo.url === 'string' &&
			logo.url.startsWith( 'http' ) &&
			! logo.url.includes( 'guid' )
	);

const buildBlockClassName = ( hideOnMobile ) =>
	[
		'logo-parade-editor',
		hideOnMobile ? 'logo-parade-editor--hidden-mobile' : '',
	]
		.filter( Boolean )
		.join( ' ' );

const Edit = ( {
	attributes,
	setAttributes,
	backgroundColor,
	setBackgroundColor,
} ) => {
	const {
		logos = [],
		rotationSpeed = 3000,
		transitionDuration = 500,
		pauseOnHover = true,
		logosPerView = 4,
		mobileLogosPerView = 2,
		hideOnMobile = false,
		logoHeight = '60px',
		gapBetweenLogos = 40,
		alignment = 'center',
		animationDirection = 'left',
		animationType = 'continuous',
		autoPlay = true,
		grayscaleEffect = true,
		hoverEffect = 'colorize',
		logoOpacity = 75,
		logoBorder = false,
		logoPadding = 0,
		showIndicators = false,
	} = attributes;

	const { colors = [] } = useSelect(
		( select ) => {
			const settings =
				select( 'core/block-editor' )?.getSettings?.() ?? {};

			return {
				colors: settings.colors || [],
			};
		},
		[]
	);

	const blockProps = useBlockProps( {
		className: buildBlockClassName( hideOnMobile ),
		style: {
			backgroundColor: backgroundColor.color,
			'--logo-height': logoHeight,
			'--logo-parade-gap': `${ gapBetweenLogos }px`,
			textAlign: alignment,
		},
	} );

	const validLogos = filterValidLogos( logos );

	const onSelectImages = ( images ) => {
		if ( ! Array.isArray( images ) || ! images.length ) {
			return;
		}

		const nextLogos = images.map( ( image ) => ( {
			id: image.id,
			url: image.url,
			alt: image.alt || '',
			linkUrl: '',
			newTab: false,
		} ) );

		setAttributes( { logos: [ ...ensureLogos( logos ), ...nextLogos ] } );
	};

	const updateLogo = ( index, updates ) => {
		const updatedLogos = [ ...validLogos ];
		updatedLogos[ index ] = { ...updatedLogos[ index ], ...updates };
		setAttributes( { logos: updatedLogos } );
	};

	const removeLogo = ( index ) => {
		const updatedLogos = validLogos.filter( ( _, i ) => i !== index );
		setAttributes( { logos: updatedLogos } );
	};

	const moveLogo = ( index, direction ) => {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if ( newIndex < 0 || newIndex >= validLogos.length ) {
			return;
		}
		const updatedLogos = [ ...validLogos ];
		[ updatedLogos[ index ], updatedLogos[ newIndex ] ] = [
			updatedLogos[ newIndex ],
			updatedLogos[ index ],
		];
		setAttributes( { logos: updatedLogos } );
	};

	return (
		<>
			<InspectorControls>
				{ validLogos.length > 0 && (
					<PanelBody
						title={ __( 'Logo Management', 'yokoi' ) }
						initialOpen
					>
						{ validLogos.map( ( logo, index ) => (
							<div
								key={ logo.id || logo.url || index }
								className="logo-parade-logo-item"
								style={ {
									display: 'flex',
									gap: '8px',
									alignItems: 'center',
									marginBottom: '12px',
									padding: '12px',
									background: '#f9f9f9',
									borderRadius: '4px',
								} }
							>
								<img
									src={ logo.url }
									alt={ logo.alt || '' }
									style={ {
										width: '40px',
										height: '40px',
										objectFit: 'contain',
										flexShrink: 0,
									} }
								/>
								<div style={ { flex: 1, minWidth: 0 } }>
									<TextControl
										label={ __( 'Alt Text', 'yokoi' ) }
										value={ logo.alt || '' }
										onChange={ ( value ) =>
											updateLogo( index, { alt: value } )
										}
										placeholder={ __( 'Logo description', 'yokoi' ) }
										__next40pxDefaultSize={ true }
										__nextHasNoMarginBottom={ true }
									/>
									<TextControl
										label={ __( 'Link URL', 'yokoi' ) }
										value={ logo.linkUrl || '' }
										onChange={ ( value ) =>
											updateLogo( index, { linkUrl: value } )
										}
										placeholder={ __( 'https://example.com', 'yokoi' ) }
										__next40pxDefaultSize={ true }
										__nextHasNoMarginBottom={ true }
									/>
									<ToggleControl
										label={ __( 'Open in new tab', 'yokoi' ) }
										checked={ logo.newTab || false }
										onChange={ ( value ) =>
											updateLogo( index, { newTab: value } )
										}
										__nextHasNoMarginBottom={ true }
									/>
								</div>
								<div
									style={ {
										display: 'flex',
										flexDirection: 'column',
										gap: '4px',
									} }
								>
									<Button
										icon={ arrowUp }
										size="small"
										variant="tertiary"
										onClick={ () => moveLogo( index, 'up' ) }
										disabled={ index === 0 }
										aria-label={ __( 'Move up', 'yokoi' ) }
									/>
									<Button
										icon={ arrowDown }
										size="small"
										variant="tertiary"
										onClick={ () => moveLogo( index, 'down' ) }
										disabled={ index === validLogos.length - 1 }
										aria-label={ __( 'Move down', 'yokoi' ) }
									/>
									<Button
										icon={ trash }
										size="small"
										variant="tertiary"
										isDestructive
										onClick={ () => removeLogo( index ) }
										aria-label={ __( 'Remove logo', 'yokoi' ) }
									/>
								</div>
							</div>
						) ) }
					</PanelBody>
				) }

				<PanelBody
					title={ __( 'Animation Settings', 'yokoi' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Auto-play', 'yokoi' ) }
						checked={ autoPlay }
						onChange={ ( value ) =>
							setAttributes( { autoPlay: value } )
						}
						help={ __(
							'Automatically rotate logos when the page loads.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<SelectControl
						label={ __( 'Animation Type', 'yokoi' ) }
						value={ animationType }
						options={ [
							{
								label: __( 'Continuous Scroll', 'yokoi' ),
								value: 'continuous',
							},
							{
								label: __( 'Carousel Step', 'yokoi' ),
								value: 'carousel',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { animationType: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<SelectControl
						label={ __( 'Animation Direction', 'yokoi' ) }
						value={ animationDirection }
						options={ [
							{ label: __( 'Left', 'yokoi' ), value: 'left' },
							{ label: __( 'Right', 'yokoi' ), value: 'right' },
							{
								label: __( 'Bidirectional', 'yokoi' ),
								value: 'bidirectional',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { animationDirection: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Rotation speed (seconds)', 'yokoi' ) }
						value={ rotationSpeed / 1000 }
						onChange={ ( value ) =>
							setAttributes( {
								rotationSpeed: Math.round( value * 1000 ),
							} )
						}
						min={ 1 }
						max={ 10 }
						step={ 0.5 }
						help={ __(
							'Time each group of logos remains visible.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Transition duration (ms)', 'yokoi' ) }
						value={ transitionDuration }
						onChange={ ( value ) =>
							setAttributes( { transitionDuration: value } )
						}
						min={ 200 }
						max={ 2000 }
						step={ 100 }
						help={ __(
							'Speed of the scrolling animation.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Pause on hover', 'yokoi' ) }
						checked={ pauseOnHover }
						onChange={ ( value ) =>
							setAttributes( { pauseOnHover: value } )
						}
						help={ __(
							'Stop the parade when visitors hover over it.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Show indicators', 'yokoi' ) }
						checked={ showIndicators }
						onChange={ ( value ) =>
							setAttributes( { showIndicators: value } )
						}
						help={ __(
							'Display navigation dots below the carousel.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Display', 'yokoi' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Logos per view (desktop)', 'yokoi' ) }
						value={ logosPerView }
						onChange={ ( value ) =>
							setAttributes( { logosPerView: value } )
						}
						min={ 1 }
						max={ 8 }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Logos per view (mobile)', 'yokoi' ) }
						value={ mobileLogosPerView }
						onChange={ ( value ) =>
							setAttributes( { mobileLogosPerView: value } )
						}
						min={ 1 }
						max={ 4 }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Hide on mobile devices', 'yokoi' ) }
						checked={ hideOnMobile }
						onChange={ ( value ) =>
							setAttributes( { hideOnMobile: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Logo Effects', 'yokoi' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Grayscale effect', 'yokoi' ) }
						checked={ grayscaleEffect }
						onChange={ ( value ) =>
							setAttributes( { grayscaleEffect: value } )
						}
						help={ __(
							'Apply grayscale filter to logos by default.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Logo opacity (%)', 'yokoi' ) }
						value={ logoOpacity }
						onChange={ ( value ) =>
							setAttributes( { logoOpacity: value } )
						}
						min={ 0 }
						max={ 100 }
						help={ __(
							'Default opacity level for logos.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<SelectControl
						label={ __( 'Hover effect', 'yokoi' ) }
						value={ hoverEffect }
						options={ [
							{ label: __( 'None', 'yokoi' ), value: 'none' },
							{
								label: __( 'Colorize', 'yokoi' ),
								value: 'colorize',
							},
							{ label: __( 'Scale', 'yokoi' ), value: 'scale' },
							{ label: __( 'Lift', 'yokoi' ), value: 'lift' },
						] }
						onChange={ ( value ) =>
							setAttributes( { hoverEffect: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Logo border', 'yokoi' ) }
						checked={ logoBorder }
						onChange={ ( value ) =>
							setAttributes( { logoBorder: value } )
						}
						help={ __(
							'Add a subtle border around each logo.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Logo padding (px)', 'yokoi' ) }
						value={ logoPadding }
						onChange={ ( value ) =>
							setAttributes( { logoPadding: value } )
						}
						min={ 0 }
						max={ 40 }
						help={ __(
							'Internal spacing around each logo.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Styling', 'yokoi' ) }
					initialOpen={ false }
				>
					<UnitControl
						label={ __( 'Logo height', 'yokoi' ) }
						value={ logoHeight }
						onChange={ ( value ) =>
							setAttributes( { logoHeight: value } )
						}
						units={ [
							{ value: 'px', label: 'px', default: 60 },
							{ value: 'rem', label: 'rem', default: 4 },
							{ value: 'em', label: 'em', default: 4 },
							{ value: '%', label: '%', default: 100 },
						] }
						help={ __(
							'Maximum rendered height for each logo.',
							'yokoi'
						) }
					/>
					<RangeControl
						label={ __( 'Gap between logos', 'yokoi' ) }
						value={ gapBetweenLogos }
						onChange={ ( value ) =>
							setAttributes( { gapBetweenLogos: value } )
						}
						min={ 0 }
						max={ 100 }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<div className="logo-parade-control">
						<span className="logo-parade-control__label">
							{ __( 'Background colour', 'yokoi' ) }
						</span>
						<ColorPalette
							colors={ colors }
							value={ backgroundColor.color }
							onChange={ setBackgroundColor }
							enableAlpha
							clearable
						/>
					</div>
					<div className="logo-parade-control">
						<span className="logo-parade-control__label">
							{ __( 'Carousel alignment', 'yokoi' ) }
						</span>
						<ButtonGroup>
							{ [ 'left', 'center', 'right' ].map( ( value ) => (
								<Button
									key={ value }
									variant={
										alignment === value ? 'primary' : 'secondary'
									}
									onClick={ () =>
										setAttributes( { alignment: value } )
									}
								>
									{ __( value.charAt( 0 ).toUpperCase() + value.slice( 1 ), 'yokoi' ) }
								</Button>
							) ) }
						</ButtonGroup>
					</div>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ validLogos.length === 0 ? (
					<div className="logo-parade-empty-state">
						<div className="logo-parade-empty-state__description">
							<h3>{ __( 'Logo Parade', 'yokoi' ) }</h3>
							<p>
								{ __(
									'Create a continuously scrolling strip of logos to highlight your favourite collaborators.',
									'yokoi'
								) }
							</p>
							<ul>
								<li>{ __( 'Smooth, automatic rotation', 'yokoi' ) }</li>
								<li>{ __( 'Pause on hover for accessibility', 'yokoi' ) }</li>
								<li>{ __( 'Responsive layout controls', 'yokoi' ) }</li>
								<li>{ __( 'Customise spacing and logo height', 'yokoi' ) }</li>
							</ul>
						</div>
						<MediaPlaceholder
							icon="slides"
							label={ __( 'Upload logos', 'yokoi' ) }
							instructions={ __(
								'Drag image files here, upload new ones, or select from the media library.',
								'yokoi'
							) }
							onSelect={ onSelectImages }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
							multiple
							value={ logos }
						/>
					</div>
				) : (
					<>
						<div
							className="logo-parade-preview"
							style={ { '--logos-per-view': logosPerView } }
						>
							<div className="logo-parade-track">
								{ validLogos.map( ( logo ) => (
									<div key={ logo.id || logo.url } className="logo-parade-item">
										<img src={ logo.url } alt={ logo.alt || '' } />
									</div>
								) ) }
							</div>
						</div>

						<div className="logo-parade-footer">
							<MediaPlaceholder
								onSelect={ onSelectImages }
								accept="image/*"
								allowedTypes={ [ 'image' ] }
								multiple
								labels={ {
									title: __( 'Add more logos', 'yokoi' ),
									instructions: __(
										'Drag images, upload new ones, or pick from the media library.',
										'yokoi'
									),
								} }
							/>
						</div>
					</>
				) }
			</div>
		</>
	);
};

export default withColors( 'backgroundColor' )( Edit );


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
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
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

	const validLogos = filterValidLogos( logos );

	if ( validLogos.length === 0 ) {
		return (
			<div { ...blockProps }>
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
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Carousel Settings', 'yokoi' ) }
					initialOpen
				>
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
					/>
					<RangeControl
						label={ __( 'Logos per view (mobile)', 'yokoi' ) }
						value={ mobileLogosPerView }
						onChange={ ( value ) =>
							setAttributes( { mobileLogosPerView: value } )
						}
						min={ 1 }
						max={ 4 }
					/>
					<ToggleControl
						label={ __( 'Hide on mobile devices', 'yokoi' ) }
						checked={ hideOnMobile }
						onChange={ ( value ) =>
							setAttributes( { hideOnMobile: value } )
						}
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
			</div>
		</>
	);
};

export default withColors( 'backgroundColor' )( Edit );


import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	TextareaControl,
	RangeControl,
	ToggleControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	ExternalLink,
} from '@wordpress/components';
import { formatUppercase, formatBold } from '@wordpress/icons';
import { useEffect, useMemo, useState } from '@wordpress/element';

import './editor.scss';

const textTransformOptions = [
	{ label: __( 'None', 'yokoi' ), value: 'none' },
	{ label: __( 'Uppercase', 'yokoi' ), value: 'uppercase' },
	{ label: __( 'Lowercase', 'yokoi' ), value: 'lowercase' },
	{ label: __( 'Capitalize', 'yokoi' ), value: 'capitalize' },
];

const fontWeightOptions = [
	{ label: __( 'Normal', 'yokoi' ), value: 'normal' },
	{ label: __( 'Bold', 'yokoi' ), value: 'bold' },
	{ label: __( 'Light', 'yokoi' ), value: '300' },
	{ label: __( 'Semi Bold', 'yokoi' ), value: '600' },
];

// Convert speed (1-100) to animation duration in seconds
// Speed 1 = slowest (60s), Speed 100 = fastest (5s)
const getAnimationDuration = ( speed ) => {
	const duration = Math.max( 5, 60 - ( ( speed - 1 ) * 55 / 99 ) );
	return `${ Math.round( duration ) }s`;
};

const splitContent = ( content = '' ) => {
	if ( ! content ) {
		return [];
	}

	if ( content.includes( '•' ) ) {
		return content.split( '•' ).map( ( item ) => item.trim() ).filter( Boolean );
	}

	return content
		.split( /\r?\n/ )
		.map( ( item ) => item.trim() )
		.filter( Boolean );
};

const PreviewTicker = ( {
	content,
	textTransform,
	fontWeight,
	fontSize,
	textColor,
	backgroundColor,
	hasBackground,
	speed,
	isAnimating,
	pauseOnHover,
} ) => {
	const items = splitContent( content );
	const originalText = items.length
		? items.join( ' • ' )
		: __(
				'Enter your ticker text… Use bullet points (•) or line breaks to separate items.',
				'yokoi'
		  );
	
	// Duplicate content multiple times for seamless scrolling (matching frontend behavior)
	// Use a ref to measure container width, but for editor preview, use a reasonable default
	// The editor preview container is typically narrower, so we'll use a conservative multiplier
	const separator = ' • ';
	const duplicatesNeeded = 8; // Enough duplicates for editor preview (typically narrower than frontend)
	const duplicatedContent = Array( duplicatesNeeded ).fill( originalText ).join( separator );

	return (
		<div className="yokoi-ticker-preview">
			<div
				className="yokoi-ticker-preview__outer"
				style={ {
					backgroundColor: hasBackground ? backgroundColor : 'transparent',
					color: textColor,
					fontSize: `${ fontSize }px`,
					fontWeight,
					textTransform,
				} }
			>
				<div
					className="yokoi-ticker-preview__content"
					style={ {
						animationDuration: getAnimationDuration( speed ),
						animationPlayState: isAnimating ? 'running' : 'paused',
					} }
				>
					<span className="yokoi-ticker-preview__text">
						{ duplicatedContent }
					</span>
				</div>
				<div className="yokoi-ticker-preview__scrim" aria-hidden="true" />
			</div>
			<div className="yokoi-ticker-preview__meta">
				<span>
					{ __( 'Speed:', 'yokoi' ) } { speed }/100
				</span>
				<span>
					{ __( 'Hover to pause is', 'yokoi' ) }{' '}
					<strong>{ pauseOnHover ? __( 'enabled', 'yokoi' ) : __( 'disabled', 'yokoi' ) }</strong>
				</span>
			</div>
		</div>
	);
};

const Edit = ( { attributes, setAttributes } ) => {
	const {
		content,
		speed,
		textColor,
		backgroundColor,
		fontSize,
		pauseOnHover,
		textTransform,
		fontWeight,
		hasBackground,
	} = attributes;

	const [ isAnimating, setIsAnimating ] = useState( true );
	const blockProps = useBlockProps( {
		className: [
			'yokoi-ticker-block',
			hasBackground ? 'has-background' : 'no-background',
			pauseOnHover ? 'is-pausable' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			backgroundColor: hasBackground ? backgroundColor : undefined,
			color: textColor,
		},
	} );

	useEffect( () => {
		setIsAnimating( true );
	}, [ content, speed ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ textTransform === 'uppercase' }
						icon={ formatUppercase }
						label={ __( 'Uppercase', 'yokoi' ) }
						onClick={ () =>
							setAttributes( {
								textTransform:
									textTransform === 'uppercase' ? 'none' : 'uppercase',
							} )
						}
					/>
					<ToolbarButton
						isPressed={ fontWeight === 'bold' }
						icon={ formatBold }
						label={ __( 'Bold', 'yokoi' ) }
						onClick={ () =>
							setAttributes( {
								fontWeight: fontWeight === 'bold' ? 'normal' : 'bold',
							} )
						}
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Ticker Items', 'yokoi' ) }>
					<BaseControl>
						<TextareaControl
							label={ __( 'Ticker Text', 'yokoi' ) }
							value={ content }
							onChange={ ( value ) => setAttributes( { content: value } ) }
							placeholder={ __(
								'Breaking News • Use bullet points or new lines to separate headlines',
								'yokoi'
							) }
							rows={ 4 }
							help={ __(
								'Separate multiple items with bullet points (•) or new lines to create a continuous ticker.',
								'yokoi'
							) }
							__nextHasNoMarginBottom={ true }
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'yokoi' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Text Transform', 'yokoi' ) }
						value={ textTransform }
						options={ textTransformOptions }
						onChange={ ( value ) => setAttributes( { textTransform: value } ) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'yokoi' ) }
						value={ fontWeight }
						options={ fontWeightOptions }
						onChange={ ( value ) => setAttributes( { fontWeight: value } ) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Font Size', 'yokoi' ) }
						value={ fontSize }
						onChange={ ( value ) => setAttributes( { fontSize: value } ) }
						min={ 12 }
						max={ 36 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Animation', 'yokoi' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Scroll Speed', 'yokoi' ) }
						value={ speed }
						onChange={ ( value ) => setAttributes( { speed: value } ) }
						min={ 1 }
						max={ 100 }
						help={ __(
							'Higher values scroll faster (1 = slowest, 100 = fastest)',
							'yokoi'
						) }
					/>
					<ToggleControl
						label={ __( 'Pause on Hover', 'yokoi' ) }
						checked={ pauseOnHover }
						onChange={ ( value ) => setAttributes( { pauseOnHover: value } ) }
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Colors', 'yokoi' ) }
					colorSettings={ [
						{
							value: textColor,
							onChange: ( value ) => setAttributes( { textColor: value } ),
							label: __( 'Text Color', 'yokoi' ),
						},
						...( hasBackground
							? [
									{
										value: backgroundColor,
										onChange: ( value ) =>
											setAttributes( { backgroundColor: value } ),
										label: __( 'Background Color', 'yokoi' ),
									},
							  ]
							: [] ),
					] }
				>
					<ToggleControl
						label={ __( 'Show Background', 'yokoi' ) }
						checked={ hasBackground }
						onChange={ ( value ) => setAttributes( { hasBackground: value } ) }
					/>
				</PanelColorSettings>
			</InspectorControls>

			<div { ...blockProps }>
				<PreviewTicker
					content={ content }
					textTransform={ textTransform }
					fontWeight={ fontWeight }
					fontSize={ fontSize }
					textColor={ textColor }
					backgroundColor={ backgroundColor }
					hasBackground={ hasBackground }
					speed={ speed }
					isAnimating={ pauseOnHover ? isAnimating : true }
					pauseOnHover={ pauseOnHover }
				/>
			</div>
		</>
	);
};

export default Edit;


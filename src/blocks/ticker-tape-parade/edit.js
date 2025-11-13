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
import { Type, Bold } from 'lucide-react';
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

const getAnimationDuration = ( speed ) => `${ Math.max( 10, 60 - speed ) }s`;

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
} ) => {
	const items = splitContent( content );

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
						{ items.length
							? items.join( ' • ' )
							: __(
									'Enter your ticker text… Use bullet points (•) or line breaks to separate items.',
									'yokoi'
							  ) }
					</span>
				</div>
				<div className="yokoi-ticker-preview__scrim" aria-hidden="true" />
			</div>
			<div className="yokoi-ticker-preview__meta">
				<span>
					{ __( 'Speed:', 'yokoi' ) } { speed } (
					{ getAnimationDuration( speed ) })
				</span>
				<span>
					{ __( 'Hover to pause is', 'yokoi' ) }{' '}
					<strong>{ __( 'enabled', 'yokoi' ) }</strong>
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

	const duration = useMemo(
		() => getAnimationDuration( speed ),
		[ speed ]
	);

	useEffect( () => {
		setIsAnimating( true );
	}, [ content, speed ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ textTransform === 'uppercase' }
						icon={ <Type size={ 16 } /> }
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
						icon={ <Bold size={ 16 } /> }
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
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'yokoi' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Text Transform', 'yokoi' ) }
						value={ textTransform }
						options={ textTransformOptions }
						onChange={ ( value ) => setAttributes( { textTransform: value } ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'yokoi' ) }
						value={ fontWeight }
						options={ fontWeightOptions }
						onChange={ ( value ) => setAttributes( { fontWeight: value } ) }
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
						min={ 5 }
						max={ 50 }
						help={ __(
							`Higher values scroll faster. Current duration: ${ duration }`,
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

				<PanelBody title={ __( 'Powered by Yokoi', 'yokoi' ) } initialOpen={ false }>
					<p className="yokoi-ticker__about">
						{ __(
							'Ticker Tape Parade delivers a classic newsroom crawl with modern typography and accessibility features.',
							'yokoi'
						) }
					</p>
					<ExternalLink href="https://iconick.io/blocks">
						{ __( 'Discover more Yokoi ideas →', 'yokoi' ) }
					</ExternalLink>
				</PanelBody>
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
				/>
			</div>
		</>
	);
};

export default Edit;


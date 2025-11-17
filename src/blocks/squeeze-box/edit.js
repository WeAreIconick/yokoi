import {
	BlockControls,
	ColorPalette,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	Flex,
	FlexItem,
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useEffect } from '@wordpress/element';

import './editor.scss';

const PLACEHOLDER_TITLES = [
	"What's behind door #1?",
	'Plot twist revealed here',
	'The good stuff is inside',
	'Spoiler alert: click me',
	'Secret treasure awaits',
	'Magic happens when you click',
	'Warning: contains awesome content',
	'Psst... the best part is hidden here',
	'Click for instant wisdom',
];

const NUMBER_WORDS = [
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine',
	'Ten',
	'Eleven',
	'Twelve',
	'Thirteen',
	'Fourteen',
	'Fifteen',
	'Sixteen',
	'Seventeen',
	'Eighteen',
	'Nineteen',
	'Twenty',
];

const MAX_ITEMS = 50;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

const sanitizeContent = ( content ) => {
	if ( typeof content !== 'string' ) {
		return '';
	}

	return content
		.replace( /<script[^>]*>.*?<\/script>/gi, '' )
		.replace( /<iframe[^>]*>.*?<\/iframe>/gi, '' )
		.replace( /<object[^>]*>.*?<\/object>/gi, '' )
		.replace( /<embed[^>]*>/gi, '' )
		.replace( /<applet[^>]*>.*?<\/applet>/gi, '' )
		.replace( /javascript:/gi, '' )
		.replace( /vbscript:/gi, '' )
		.replace( /data:/gi, '' )
		.replace( /on\w+="[^"]*"/gi, '' )
		.replace( /on\w+='[^']*'/gi, '' )
		.replace( /on\w+=[^\s>]*/gi, '' );
};

const validateInputLength = ( value, maxLength ) =>
	typeof value === 'string' && value.length <= maxLength;

const getRandomPlaceholderTitle = () => {
	try {
		return PLACEHOLDER_TITLES[
			Math.floor( Math.random() * PLACEHOLDER_TITLES.length )
		];
	} catch ( error ) {
		return PLACEHOLDER_TITLES[ 0 ];
	}
};

const getNumberWord = ( index ) => {
	if ( typeof index !== 'number' || index < 0 ) {
		return 'Panel 1';
	}

	return NUMBER_WORDS[ index ] || `Panel ${ index + 1 }`;
};

const validateColor = ( color ) => {
	if ( ! color || typeof color !== 'string' ) {
		return '#227093';
	}

	const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return hexColorRegex.test( color ) ? color : '#227093';
};

const Edit = ( { attributes, setAttributes, clientId } ) => {
	const {
		items = [],
		mode = 'multiple',
		primaryColor = '#227093',
		uniqueId,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId && clientId && typeof clientId === 'string' ) {
			const sanitizedClientId = clientId
				.replace( /[^a-zA-Z0-9]/g, '' )
				.slice( 0, 8 );
			setAttributes( { uniqueId: `yokoi-squeeze-box-${ sanitizedClientId }` } );
		}
	}, [ clientId, uniqueId, setAttributes ] );

	const updateItem = ( index, key, value ) => {
		if (
			typeof index !== 'number' ||
			index < 0 ||
			index >= items.length ||
			typeof key !== 'string' ||
			! key.trim()
		) {
			return;
		}

		const normalizedValue =
			typeof value === 'string' ? value : String( value || '' );

		if (
			( key === 'title' &&
				! validateInputLength( normalizedValue, MAX_TITLE_LENGTH ) ) ||
			( key === 'content' &&
				! validateInputLength( normalizedValue, MAX_CONTENT_LENGTH ) )
		) {
			return;
		}

		try {
			const nextItems = [ ...items ];
			nextItems[ index ] = {
				...nextItems[ index ],
				[ key ]: sanitizeContent( normalizedValue ),
			};
			setAttributes( { items: nextItems } );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			// Silent error handling
		}
	};

	const addItem = () => {
		try {
			if ( items.length >= MAX_ITEMS ) {
				return;
			}

			const nextItems = [
				...items,
				{
					title: '',
					content: '',
					isOpen: false,
				},
			];
			setAttributes( { items: nextItems } );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			// Silent error handling
		}
	};

	const removeItem = ( index ) => {
		try {
			if (
				typeof index !== 'number' ||
				items.length <= 1 ||
				index < 0 ||
				index >= items.length
			) {
				return;
			}

			const nextItems = items.filter( ( _, itemIndex ) => itemIndex !== index );
			setAttributes( { items: nextItems } );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			// Silent error handling
		}
	};

	const blockProps = useBlockProps( {
		style: {
			'--squeeze-box-primary': validateColor( primaryColor ),
		},
	} );

	if ( ! Array.isArray( items ) ) {
		return (
			<div { ...blockProps }>
				<p>
					{ __(
						'Error: Invalid block data. Please refresh and try again.',
						'yokoi'
					) }
				</p>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add Panel', 'yokoi' ) }
						onClick={ addItem }
						disabled={ items.length >= MAX_ITEMS }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Squeeze Box Settings', 'yokoi' ) }>
					<SelectControl
						label={ __( 'Mode', 'yokoi' ) }
						value={ mode }
						options={ [
							{
								label: __( 'Multiple panels open', 'yokoi' ),
								value: 'multiple',
							},
							{
								label: __( 'Single panel open', 'yokoi' ),
								value: 'single',
							},
						] }
						onChange={ ( newMode ) => {
							if ( newMode === 'multiple' || newMode === 'single' ) {
								setAttributes( { mode: newMode } );
							}
						} }
						help={ __(
							'Choose whether multiple panels can be open at once or just one.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Style', 'yokoi' ) }
					initialOpen={ false }
				>
					<BaseControl label={ __( 'Primary Color', 'yokoi' ) } __nextHasNoMarginBottom={ true }>
						<ColorPalette
							value={ primaryColor }
							onChange={ ( color ) =>
								setAttributes( { primaryColor: validateColor( color ) } )
							}
							clearable={ false }
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ items.map( ( item, index ) => (
					<div className="squeeze-box-panel" key={ `panel-${ index }` }>
						<div className="squeeze-box-panel__header">
							<Flex justify="flex-end" align="center">
								<FlexItem>
									<Button
										variant="link"
										isDestructive
										size="small"
										onClick={ () => removeItem( index ) }
										disabled={ items.length === 1 }
										aria-label={
											__(
												'Remove panel',
												'yokoi'
											) +
											' ' +
											getNumberWord( index )
										}
									>
										{ __( 'Remove', 'yokoi' ) }
									</Button>
								</FlexItem>
							</Flex>
						</div>
						<div className="squeeze-box-panel__body">
							<TextControl
								label={ __( 'Title', 'yokoi' ) }
								value={ item.title || '' }
								placeholder={ getRandomPlaceholderTitle() }
								onChange={ ( value ) =>
									updateItem( index, 'title', value )
								}
								maxLength={ MAX_TITLE_LENGTH }
								__next40pxDefaultSize={ true }
								__nextHasNoMarginBottom={ true }
							/>
							<TextareaControl
								label={ __( 'Content', 'yokoi' ) }
								value={ item.content || '' }
								placeholder={ __(
									'This humble text box is ready to become whatever you need it to be. Go ahead, make it shine!',
									'yokoi'
								) }
								onChange={ ( value ) =>
									updateItem( index, 'content', value )
								}
								rows={ 4 }
								maxLength={ MAX_CONTENT_LENGTH }
								__nextHasNoMarginBottom={ true }
							/>
						</div>
					</div>
				) ) }
			</div>
		</>
	);
};

export default Edit;


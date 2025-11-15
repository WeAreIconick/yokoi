import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	ButtonGroup,
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	TabPanel,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import {
	plus,
	trash,
	arrowLeft,
	arrowRight,
	upload,
} from '@wordpress/icons';
import { useState } from '@wordpress/element';

import './editor.scss';

const DEFAULT_AUTO_PLAY_DELAY = 5000;
const MIN_AUTO_PLAY_DELAY = 2000;
const MAX_AUTO_PLAY_DELAY = 10000;
const AUTO_PLAY_STEP = 500;
const MIN_CARD_SIZE = 200;
const MAX_CARD_SIZE = 600;

const sanitizeString = ( value ) =>
	typeof value === 'string' ? value : String( value ?? '' );

const stripTags = ( value ) =>
	sanitizeString( value ).replace( /<[^>]*>?/gm, '' );

const createEmptyCard = ( id ) => ( {
	id,
	frontTitle: '',
	backTitle: '',
	frontContent: '',
	backContent: '',
	frontImageId: null,
	frontImageUrl: '',
	frontImageAlt: '',
	backImageId: null,
	backImageUrl: '',
	backImageAlt: '',
} );

const generateCardId = ( cards ) => {
	if ( ! Array.isArray( cards ) || ! cards.length ) {
		return 1;
	}

	const ids = cards
		.map( ( card ) => card?.id ?? 0 )
		.filter( ( value ) => Number.isFinite( value ) );

	const maxId = Math.max( ...ids, 0 );
	return maxId + 1;
};

const toCardOptions = ( cards ) =>
	cards.map( ( card, index ) => ( {
		label: sprintf(
			/* translators: %d: card number, %s: card title */
			__( 'Card %1$d: %2$s', 'yokoi' ),
			index + 1,
			card.frontTitle?.trim() || __( 'Untitled', 'yokoi' )
		),
		value: index,
	} ) );

const clamp = ( value, min, max ) =>
	Math.min( Math.max( value, min ), max );

const withFallback = ( value, fallback ) =>
	Number.isFinite( value ) ? value : fallback;

const FlipSideEdit = ( { attributes, setAttributes } ) => {
	const {
		cards = [ createEmptyCard( 1 ) ],
		currentCard = 0,
		cardWidth = 300,
		cardHeight = 400,
		frontColor = '#6366f1',
		backColor = '#ec4899',
		textColor = '#ffffff',
		showNavigation = true,
		showIndicators = true,
		autoPlay = false,
		autoPlayDelay = DEFAULT_AUTO_PLAY_DELAY,
	} = attributes;

	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );

	const safeCards =
		Array.isArray( cards ) && cards.length
			? cards.map( ( card, index ) => ( {
					...createEmptyCard( index + 1 ),
					...card,
				} ) )
			: [ createEmptyCard( 1 ) ];

	const selectedCard =
		safeCards[ clamp( selectedCardIndex, 0, safeCards.length - 1 ) ];
	const previewCard =
		safeCards[ clamp( currentCard, 0, safeCards.length - 1 ) ];

	const setCards = ( nextCards ) => {
		setAttributes( { cards: nextCards } );
	};

	const addCard = () => {
		const newId = generateCardId( safeCards );
		setCards( [ ...safeCards, createEmptyCard( newId ) ] );
		setSelectedCardIndex( safeCards.length );
	};

	const removeCard = ( index ) => {
		if ( safeCards.length <= 1 ) {
			return;
		}

		const nextCards = safeCards.filter(
			( _card, cardIndex ) => cardIndex !== index
		);
		setCards( nextCards );

		const nextSelected = clamp(
			index >= nextCards.length ? nextCards.length - 1 : index,
			0,
			nextCards.length - 1
		);
		setSelectedCardIndex( nextSelected );

		if ( currentCard >= nextCards.length ) {
			setAttributes( { currentCard: 0 } );
		}
	};

	const updateCard = ( index, field, value ) => {
		const nextCards = safeCards.map( ( card, cardIndex ) => {
			if ( cardIndex !== index ) {
			 return card;
			}

			const nextValue =
				field.endsWith( 'Content' ) || field.endsWith( 'Title' )
					? stripTags( value )
					: value;

			return {
				...card,
				[ field ]: nextValue,
			};
		} );

		setCards( nextCards );
	};

	const setCardMedia = ( index, prefix, media ) => {
		if ( ! media ) {
			return;
		}

		updateCard( index, `${ prefix }ImageId`, media.id ?? null );
		updateCard( index, `${ prefix }ImageUrl`, media.url ?? '' );
		updateCard( index, `${ prefix }ImageAlt`, media.alt ?? '' );
	};

	const clearCardMedia = ( index, prefix ) => {
		updateCard( index, `${ prefix }ImageId`, null );
		updateCard( index, `${ prefix }ImageUrl`, '' );
		updateCard( index, `${ prefix }ImageAlt`, '' );
	};

	const navigateCard = ( direction ) => {
		if ( safeCards.length <= 1 ) {
			return;
		}

		const nextIndex =
			direction === 'next'
				? ( currentCard + 1 ) % safeCards.length
				: currentCard === 0
					? safeCards.length - 1
					: currentCard - 1;

		setAttributes( { currentCard: nextIndex } );
	};

	const cardOptions = toCardOptions( safeCards );

	const blockProps = useBlockProps( {
		className: 'flip-side-container',
		style: {
			'--card-width': `${ clamp( cardWidth, MIN_CARD_SIZE, MAX_CARD_SIZE ) }px`,
			'--card-height': `${ clamp( cardHeight, MIN_CARD_SIZE, MAX_CARD_SIZE ) }px`,
			'--front-color': sanitizeString( frontColor ),
			'--back-color': sanitizeString( backColor ),
			'--text-color': sanitizeString( textColor ),
		},
	} );

	const autoPlayDelayValue = clamp(
		withFallback( autoPlayDelay, DEFAULT_AUTO_PLAY_DELAY ),
		MIN_AUTO_PLAY_DELAY,
		MAX_AUTO_PLAY_DELAY
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Card Management', 'yokoi' ) }
					initialOpen
				>
					<BaseControl
						label={ __( 'Total Cards', 'yokoi' ) }
						help={ sprintf(
							/* translators: %d: number of cards */
							__(
								'You have %d card(s) in this carousel.',
								'yokoi'
							),
							safeCards.length
						) }
						__nextHasNoMarginBottom={ true }
					>
						<div className="card-management-buttons">
							<Button
								icon={ plus }
								variant="primary"
								onClick={ addCard }
							>
								{ __( 'Add Card', 'yokoi' ) }
							</Button>
							{ safeCards.length > 1 && (
								<Button
									icon={ trash }
									variant="secondary"
									isDestructive
									onClick={ () =>
										removeCard( selectedCardIndex )
									}
								>
									{ __( 'Remove Card', 'yokoi' ) }
								</Button>
							) }
						</div>
					</BaseControl>

					{ safeCards.length > 1 && (
						<SelectControl
							label={ __( 'Edit Card', 'yokoi' ) }
							value={ selectedCardIndex }
							onChange={ ( value ) =>
								setSelectedCardIndex( Number( value ) )
							}
							options={ cardOptions }
							help={ __(
								'Select which card to edit below.',
								'yokoi'
							) }
							__next40pxDefaultSize={ true }
							__nextHasNoMarginBottom={ true }
						/>
					) }

					<TabPanel
						className="card-content-tabs"
						activeClass="active-tab"
						tabs={ [
							{
								name: 'front',
								title: __( 'Front Side', 'yokoi' ),
								className: 'tab-front',
							},
							{
								name: 'back',
								title: __( 'Back Side', 'yokoi' ),
								className: 'tab-back',
							},
						] }
					>
						{ ( tab ) => {
							const card = selectedCard;
							if ( ! card ) {
								return null;
							}

							const isFront = tab.name === 'front';
							const titleField = isFront
								? 'frontTitle'
								: 'backTitle';
							const contentField = isFront
								? 'frontContent'
								: 'backContent';
							const mediaPrefix = isFront ? 'front' : 'back';

							return (
								<div className={ `tab-content tab-${ tab.name }` }>
									<TextControl
										label={
											isFront
												? __( 'Front Title', 'yokoi' )
												: __( 'Back Title', 'yokoi' )
										}
										value={ card[ titleField ] }
										onChange={ ( value ) =>
											updateCard(
												selectedCardIndex,
												titleField,
												value
											)
										}
										placeholder={
											isFront
												? __(
														'Enter your title…',
														'yokoi'
													)
												: __(
														'Enter back title…',
														'yokoi'
													)
										}
										__next40pxDefaultSize={ true }
										__nextHasNoMarginBottom={ true }
									/>
									<TextareaControl
										label={
											isFront
												? __( 'Front Content', 'yokoi' )
												: __( 'Back Content', 'yokoi' )
										}
										value={ card[ contentField ] }
										onChange={ ( value ) =>
											updateCard(
												selectedCardIndex,
												contentField,
												value
											)
										}
										rows={ 4 }
										placeholder={
											isFront
												? __(
														'Write your main content here…',
														'yokoi'
													)
												: __(
														'Write details that appear on flip…',
														'yokoi'
													)
										}
										__nextHasNoMarginBottom={ true }
									/>
									<BaseControl
										label={
											isFront
												? __( 'Front Image', 'yokoi' )
												: __( 'Back Image', 'yokoi' )
										}
										__nextHasNoMarginBottom={ true }
									>
										<MediaUploadCheck>
											<MediaUpload
												allowedTypes={ [ 'image' ] }
												value={
													card[
														`${ mediaPrefix }ImageId`
													]
												}
												onSelect={ ( media ) =>
													setCardMedia(
														selectedCardIndex,
														mediaPrefix,
														media
													)
												}
												render={ ( { open } ) => (
													<div className="image-control">
														{ ! card[
															`${ mediaPrefix }ImageUrl`
														] && (
															<Button
																variant="secondary"
																icon={ upload }
																onClick={ open }
															>
																{ __(
																	'Upload Image',
																	'yokoi'
																) }
															</Button>
														) }
														{ card[
															`${ mediaPrefix }ImageUrl`
														] && (
															<div className="image-preview">
																<img
																	src={
																		card[
																			`${ mediaPrefix }ImageUrl`
																		]
																	}
																	alt={
																		card[
																			`${ mediaPrefix }ImageAlt`
																		] || ''
																	}
																	width="100"
																/>
																<div className="image-actions">
																	<Button
																		variant="secondary"
																		onClick={ open }
																	>
																		{ __(
																			'Replace',
																			'yokoi'
																		) }
																	</Button>
																	<Button
																		variant="link"
																		isDestructive
																		onClick={ () =>
																			clearCardMedia(
																				selectedCardIndex,
																				mediaPrefix
																			)
																		}
																	>
																		{ __(
																			'Remove',
																			'yokoi'
																		) }
																	</Button>
																</div>
															</div>
														) }
													</div>
												) }
											/>
										</MediaUploadCheck>
									</BaseControl>
								</div>
							);
						} }
					</TabPanel>
				</PanelBody>

				<PanelBody title={ __( 'Navigation Settings', 'yokoi' ) }>
					<ToggleControl
						label={ __( 'Show Navigation Arrows', 'yokoi' ) }
						checked={ showNavigation }
						onChange={ ( value ) =>
							setAttributes( { showNavigation: value } )
						}
						help={ __(
							'Display arrows to navigate between cards.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Show Indicators', 'yokoi' ) }
						checked={ showIndicators }
						onChange={ ( value ) =>
							setAttributes( { showIndicators: value } )
						}
						help={ __(
							'Display dots to indicate card position.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Auto Play', 'yokoi' ) }
						checked={ autoPlay }
						onChange={ ( value ) =>
							setAttributes( { autoPlay: value } )
						}
						help={ __(
							'Automatically cycle through cards.',
							'yokoi'
						) }
						__nextHasNoMarginBottom={ true }
					/>
					{ autoPlay && (
						<RangeControl
							label={ __( 'Auto Play Delay', 'yokoi' ) }
							value={ autoPlayDelayValue }
							onChange={ ( value ) =>
								setAttributes( {
									autoPlayDelay: clamp(
										value,
										MIN_AUTO_PLAY_DELAY,
										MAX_AUTO_PLAY_DELAY
									),
								} )
							}
							min={ MIN_AUTO_PLAY_DELAY }
							max={ MAX_AUTO_PLAY_DELAY }
							step={ AUTO_PLAY_STEP }
							help={ __(
								'Time between card transitions in milliseconds.',
								'yokoi'
							) }
							__next40pxDefaultSize={ true }
							__nextHasNoMarginBottom={ true }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Card Dimensions', 'yokoi' ) }>
					<RangeControl
						label={ __( 'Card Width', 'yokoi' ) }
						value={ clamp( cardWidth, MIN_CARD_SIZE, MAX_CARD_SIZE ) }
						onChange={ ( value ) =>
							setAttributes( {
								cardWidth: clamp(
									value,
									MIN_CARD_SIZE,
									MAX_CARD_SIZE
								),
							} )
						}
						min={ MIN_CARD_SIZE }
						max={ MAX_CARD_SIZE }
						help={ __(
							'Width of the card in pixels.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Card Height', 'yokoi' ) }
						value={ clamp(
							cardHeight,
							MIN_CARD_SIZE,
							MAX_CARD_SIZE
						) }
						onChange={ ( value ) =>
							setAttributes( {
								cardHeight: clamp(
									value,
									MIN_CARD_SIZE,
									MAX_CARD_SIZE
								),
							} )
						}
						min={ MIN_CARD_SIZE }
						max={ MAX_CARD_SIZE }
						help={ __(
							'Height of the card in pixels.',
							'yokoi'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Card Colors', 'yokoi' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: frontColor,
							onChange: ( color ) =>
								setAttributes( { frontColor: color } ),
							label: __(
								'Front Side Background',
								'yokoi'
							),
						},
						{
							value: backColor,
							onChange: ( color ) =>
								setAttributes( { backColor: color } ),
							label: __( 'Back Side Background', 'yokoi' ),
						},
						{
							value: textColor,
							onChange: ( color ) =>
								setAttributes( { textColor: color } ),
							label: __( 'Text Color', 'yokoi' ),
						},
					] }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ safeCards.length > 1 && (
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Use the navigation controls to preview different cards.',
							'yokoi'
						) }
					</Notice>
				) }

				<div className="flip-card-carousel">
					{ showNavigation && safeCards.length > 1 && (
						<Button
							className="carousel-nav prev"
							onClick={ () => navigateCard( 'prev' ) }
							aria-label={ __( 'Previous card', 'yokoi' ) }
							icon={ arrowLeft }
							size="large"
							variant="secondary"
						/>
					) }

					<div className="flip-card">
						<div className="flip-card-inner">
							<div className="flip-card-front">
								<div className="flip-card-content">
									{ previewCard.frontImageUrl && (
										<div className="card-image">
											<img
												src={
													previewCard.frontImageUrl
												}
												alt={
													previewCard.frontImageAlt ||
													''
												}
											/>
										</div>
									) }
									<h3>
										{ previewCard.frontTitle ||
											__( 'Enter your title…', 'yokoi' ) }
									</h3>
									<p>
										{ previewCard.frontContent ||
											__(
												'Write your main content here…',
												'yokoi'
											) }
									</p>
								</div>
							</div>
							<div className="flip-card-back">
								<div className="flip-card-content">
									{ previewCard.backImageUrl && (
										<div className="card-image">
											<img
												src={ previewCard.backImageUrl }
												alt={
													previewCard.backImageAlt ||
													''
												}
											/>
										</div>
									) }
									<h3>
										{ previewCard.backTitle ||
											__( 'Enter back title…', 'yokoi' ) }
									</h3>
									<p>
										{ previewCard.backContent ||
											__(
												'Write details that appear when users hover…',
												'yokoi'
											) }
									</p>
								</div>
							</div>
						</div>
					</div>

					{ showNavigation && safeCards.length > 1 && (
						<Button
							className="carousel-nav next"
							onClick={ () => navigateCard( 'next' ) }
							aria-label={ __( 'Next card', 'yokoi' ) }
							icon={ arrowRight }
							size="large"
							variant="secondary"
						/>
					) }
				</div>

				{ showIndicators && safeCards.length > 1 && (
					<div className="carousel-indicators">
						{ safeCards.map( ( _card, index ) => (
							<button
								key={ index }
								className={ `indicator ${ currentCard === index ? 'active' : '' }` }
								onClick={ () =>
									setAttributes( { currentCard: index } )
								}
								aria-label={ sprintf(
									/* translators: %d: card number */
									__( 'Go to card %d', 'yokoi' ),
									index + 1
								) }
							/>
						) ) }
					</div>
				) }

				<div className="editor-note">
					{ __( 'Hover to preview the content', 'yokoi' ) }
					{ safeCards.length > 1 && (
						<>
							{ ' • ' }
							{ sprintf(
								/* translators: 1: current card, 2: total cards */
								__( 'Card %1$d of %2$d', 'yokoi' ),
								currentCard + 1,
								safeCards.length
							) }
						</>
					) }
				</div>
			</div>
		</>
	);
};

export default FlipSideEdit;


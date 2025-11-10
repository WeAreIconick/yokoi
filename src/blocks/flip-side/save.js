import { useBlockProps } from '@wordpress/block-editor';

const sanitizeCard = ( card = {} ) => ( {
	id: Number.isFinite( card.id ) ? card.id : null,
	frontTitle: card.frontTitle ?? '',
	backTitle: card.backTitle ?? '',
	frontContent: card.frontContent ?? '',
	backContent: card.backContent ?? '',
	frontImageId: card.frontImageId ?? null,
	frontImageUrl: card.frontImageUrl ?? '',
	frontImageAlt: card.frontImageAlt ?? '',
	backImageId: card.backImageId ?? null,
	backImageUrl: card.backImageUrl ?? '',
	backImageAlt: card.backImageAlt ?? '',
} );

const toDatasetString = ( value ) =>
	typeof value === 'string' ? value : JSON.stringify( value );

const FlipSideSave = ( { attributes } ) => {
	const {
		cards = [],
		cardWidth = 300,
		cardHeight = 400,
		frontColor = '#6366f1',
		backColor = '#ec4899',
		textColor = '#ffffff',
		showNavigation = true,
		showIndicators = true,
		autoPlay = false,
		autoPlayDelay = 5000,
	} = attributes;

	const safeCards =
		Array.isArray( cards ) && cards.length
			? cards.map( sanitizeCard )
			: [ sanitizeCard( { id: 1 } ) ];

	const blockProps = useBlockProps.save( {
		className: 'flip-side-container',
		style: {
			'--card-width': `${ cardWidth }px`,
			'--card-height': `${ cardHeight }px`,
			'--front-color': frontColor,
			'--back-color': backColor,
			'--text-color': textColor,
		},
		'data-cards': toDatasetString( safeCards ),
		'data-show-navigation': showNavigation ? 'true' : 'false',
		'data-show-indicators': showIndicators ? 'true' : 'false',
		'data-auto-play': autoPlay ? 'true' : 'false',
		'data-auto-play-delay': String( autoPlayDelay ),
	} );

	const firstCard = safeCards[ 0 ];

	return (
		<div { ...blockProps }>
			<div className="flip-card-carousel">
				{ showNavigation && safeCards.length > 1 && (
					<button
						className="carousel-nav prev"
						aria-label="Previous card"
						type="button"
					>
						<span className="nav-icon" aria-hidden="true">
							‹
						</span>
					</button>
				) }

				<div
					className="flip-card"
					role="button"
					tabIndex="0"
					aria-pressed="false"
				>
					<div className="flip-card-inner">
						<div className="flip-card-front">
							<div className="flip-card-content">
								{ firstCard.frontImageUrl && (
									<div className="card-image">
										<img
											src={ firstCard.frontImageUrl }
											alt={ firstCard.frontImageAlt || '' }
										/>
									</div>
								) }
								{ firstCard.frontTitle && (
									<h3>{ firstCard.frontTitle }</h3>
								) }
								{ firstCard.frontContent && (
									<p>{ firstCard.frontContent }</p>
								) }
							</div>
						</div>
						<div className="flip-card-back">
							<div className="flip-card-content">
								{ firstCard.backImageUrl && (
									<div className="card-image">
										<img
											src={ firstCard.backImageUrl }
											alt={ firstCard.backImageAlt || '' }
										/>
									</div>
								) }
								{ firstCard.backTitle && (
									<h3>{ firstCard.backTitle }</h3>
								) }
								{ firstCard.backContent && (
									<p>{ firstCard.backContent }</p>
								) }
							</div>
						</div>
					</div>
				</div>

				{ showNavigation && safeCards.length > 1 && (
					<button
						className="carousel-nav next"
						aria-label="Next card"
						type="button"
					>
						<span className="nav-icon" aria-hidden="true">
							›
						</span>
					</button>
				) }
			</div>

			{ showIndicators && safeCards.length > 1 && (
				<div className="carousel-indicators">
					{ safeCards.map( ( _card, index ) => (
						<button
							key={ index }
							className={ `indicator ${ index === 0 ? 'active' : '' }` }
							aria-label={ `Go to card ${ index + 1 }` }
							aria-pressed={ index === 0 ? 'true' : 'false' }
							type="button"
						/>
					) ) }
				</div>
			) }
		</div>
	);
};

export default FlipSideSave;


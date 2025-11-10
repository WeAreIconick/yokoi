import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
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

	const blockProps = useBlockProps.save( {
		className: [
			'yokoi-ticker-block',
			pauseOnHover ? 'is-pausable' : '',
			hasBackground ? 'has-background' : 'no-background',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			backgroundColor: hasBackground ? backgroundColor : undefined,
			color: textColor,
			fontSize: `${ fontSize }px`,
			textTransform,
			fontWeight,
		},
		'data-speed': speed,
	} );

	return (
		<div { ...blockProps }>
			<div className="yokoi-ticker__outer">
				<div className="yokoi-ticker__content">
					<span className="yokoi-ticker__text">{ content }</span>
				</div>
				<div className="yokoi-ticker__scrim" aria-hidden="true" />
			</div>
		</div>
	);
}


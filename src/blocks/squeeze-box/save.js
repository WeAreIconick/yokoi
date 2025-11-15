import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const sanitizeAttribute = ( value ) => {
	if ( typeof value !== 'string' ) {
		return '';
	}

	return value
		.replace( /[<>"'&]/g, ( match ) => {
			switch ( match ) {
				case '<':
					return '&lt;';
				case '>':
					return '&gt;';
				case '"':
					return '&quot;';
				case "'":
					return '&#39;';
				case '&':
					return '&amp;';
				default:
					return match;
			}
		} )
		.replace( /[^\w\s-]/g, '' )
		.trim();
};

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
		.replace( /on\w+=[^\s>]*/gi, '' )
		.trim();
};

const validateColor = ( color ) => {
	if ( ! color || typeof color !== 'string' ) {
		return '#227093';
	}

	const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return hexColorRegex.test( color ) ? color : '#227093';
};

const validateUniqueId = ( id ) => {
	if ( ! id || typeof id !== 'string' ) {
		return 'yokoi-squeeze-box';
	}

	const sanitized = id.replace( /[^a-zA-Z0-9-]/g, '' ).substring( 0, 50 );
	return sanitized || 'yokoi-squeeze-box';
};

const Save = ( { attributes } ) => {
	try {
		const {
			items = [],
			mode = 'multiple',
			primaryColor = '#227093',
			uniqueId,
		} = attributes;

		if ( ! Array.isArray( items ) || items.length === 0 ) {
			return null;
		}

		const validatedUniqueId = validateUniqueId( uniqueId );
		const validatedPrimaryColor = validateColor( primaryColor );
		const validatedMode =
			mode === 'single' || mode === 'multiple' ? mode : 'multiple';

		const blockProps = useBlockProps.save( {
			style: {
				'--squeeze-box-primary': validatedPrimaryColor,
			},
		} );

		const squeezeBoxClass =
			validatedMode === 'single'
				? 'squeeze-box squeeze-box--radio'
				: 'squeeze-box';

		const validItems = items
			.map( ( item, index ) => ( {
				...item,
				index,
				title: sanitizeContent( item.title || '' ),
				content: sanitizeContent( item.content || '' ),
				isOpen: Boolean( item.isOpen ),
			} ) )
			.filter(
				( item ) =>
					item.title.trim() !== '' || item.content.trim() !== ''
			);

		if ( validItems.length === 0 ) {
			return null;
		}

		return (
			<div { ...blockProps }>
				<section className={ squeezeBoxClass }>
					{ validItems.map( ( item ) => {
						const inputId = sanitizeAttribute(
							`${ validatedUniqueId }-${ item.index }`
						);
						const inputType =
							validatedMode === 'single' ? 'radio' : 'checkbox';
						const inputName =
							validatedMode === 'single'
								? sanitizeAttribute( validatedUniqueId )
								: sanitizeAttribute(
										`${ validatedUniqueId }-${ item.index }`
								  );

						return (
							<div key={ `panel-${ item.index }` } className="tab">
								<input
									type={ inputType }
									name={ inputName }
									id={ inputId }
									defaultChecked={ item.isOpen }
									aria-describedby={ `${ inputId }-content` }
								/>
								<label
									htmlFor={ inputId }
									className="tab__label"
								>
									{ item.title ||
										__( 'Untitled Panel', 'yokoi' ) }
								</label>
								<div
									className="tab__content"
									id={ `${ inputId }-content` }
									role="region"
									aria-labelledby={ inputId }
								>
									<p>
										{ item.content ||
											__(
												'No content provided.',
												'yokoi'
											) }
									</p>
								</div>
							</div>
						);
					} ) }

					{ validatedMode === 'single' && validItems.length > 0 && (
						<div className="tab">
							<input
								type="radio"
								name={ sanitizeAttribute( validatedUniqueId ) }
								id={ sanitizeAttribute(
									`${ validatedUniqueId }-close`
								) }
								defaultChecked={ ! validItems.some(
									( item ) => item.isOpen
								) }
								aria-label={ __( 'Close all panels', 'yokoi' ) }
							/>
							<label
								htmlFor={ sanitizeAttribute(
									`${ validatedUniqueId }-close`
								) }
								className="tab__close"
							>
								{ __( 'Close open tab', 'yokoi' ) } ×
							</label>
						</div>
					) }
				</section>
			</div>
		);
	} catch ( error ) {
		// eslint-disable-next-line no-console
		// Silent error handling
		return null;
	}
};

export default Save;


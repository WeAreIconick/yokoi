/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { 
	PanelBody, 
	ToggleControl, 
	TextControl,
	CheckboxControl,
	BaseControl
} from '@wordpress/components';

/**
 * Edit component for NavyGator block
 */
export default function Edit( { attributes, setAttributes } ) {
	const { headingLevels, showNumbers, title, backgroundColor, textColor } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-yokoi-navygator',
	} );

	// Helper function to check if a heading level is selected
	const isHeadingLevelSelected = ( level ) => {
		return headingLevels.includes( level );
	};

	// Toggle heading level selection
	const toggleHeadingLevel = ( level ) => {
		const newLevels = isHeadingLevelSelected( level )
			? headingLevels.filter( ( l ) => l !== level )
			: [ ...headingLevels, level ].sort();
		
		setAttributes( { headingLevels: newLevels } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Table of Contents Settings', 'yokoi' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Title', 'yokoi' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
						help={ __( 'The title displayed at the top of the table of contents', 'yokoi' ) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>

					<ToggleControl
						label={ __( 'Show Numbers', 'yokoi' ) }
						checked={ showNumbers }
						onChange={ ( value ) => setAttributes( { showNumbers: value } ) }
						help={ __( 'Display numbered list instead of bullets', 'yokoi' ) }
						__nextHasNoMarginBottom={ true }
					/>

					<BaseControl
						label={ __( 'Heading Levels', 'yokoi' ) }
						help={ __( 'Select which heading levels to include in the table of contents', 'yokoi' ) }
						__nextHasNoMarginBottom={ true }
					>
						<div style={ { marginTop: '8px' } }>
							{ [ 1, 2, 3, 4, 5, 6 ].map( ( level ) => (
								<CheckboxControl
									key={ level }
									label={ __( `Heading ${ level } (H${ level })`, 'yokoi' ) }
									checked={ isHeadingLevelSelected( level ) }
									onChange={ () => toggleHeadingLevel( level ) }
									__nextHasNoMarginBottom={ true }
								/>
							) ) }
						</div>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Color Settings', 'yokoi' ) } initialOpen={ false }>
					<BaseControl label={ __( 'Background Color', 'yokoi' ) } __nextHasNoMarginBottom={ true }>
						<ColorPalette
							value={ backgroundColor }
							onChange={ ( value ) => setAttributes( { backgroundColor: value } ) }
						/>
					</BaseControl>

					<BaseControl label={ __( 'Text Color', 'yokoi' ) } __nextHasNoMarginBottom={ true }>
						<ColorPalette
							value={ textColor }
							onChange={ ( value ) => setAttributes( { textColor: value } ) }
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="wp-block-yokoi-navygator__preview">
					<div 
						className="wp-block-yokoi-navygator__preview-box"
						style={ {
							backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.98)',
							color: textColor || '#1e293b',
							borderColor: backgroundColor || 'rgba(0, 0, 0, 0.1)',
						} }
					>
						{ title && (
							<div className="wp-block-yokoi-navygator__preview-title">{ title }</div>
						) }
						
						<div className="wp-block-yokoi-navygator__preview-content">
							{ headingLevels.length === 0 ? (
								<div className="wp-block-yokoi-navygator__preview-empty">
									{ __( 'Please select at least one heading level in the block settings.', 'yokoi' ) }
								</div>
							) : (
								<>
									<div className="wp-block-yokoi-navygator__preview-info">
										{ __( 'Table of contents will be generated from your page headings:', 'yokoi' ) }
									</div>
									{ showNumbers ? (
										<ol className="wp-block-yokoi-navygator__preview-list">
											<li>{ __( 'Introduction', 'yokoi' ) }</li>
											<li>{ __( 'Getting Started', 'yokoi' ) }</li>
											<li>
												{ __( 'Advanced Features', 'yokoi' ) }
												<ol>
													<li>{ __( 'Customization Options', 'yokoi' ) }</li>
												</ol>
											</li>
											<li>{ __( 'Conclusion', 'yokoi' ) }</li>
										</ol>
									) : (
										<ul className="wp-block-yokoi-navygator__preview-list">
											<li>{ __( 'Introduction', 'yokoi' ) }</li>
											<li>{ __( 'Getting Started', 'yokoi' ) }</li>
											<li>
												{ __( 'Advanced Features', 'yokoi' ) }
												<ul>
													<li>{ __( 'Customization Options', 'yokoi' ) }</li>
												</ul>
											</li>
											<li>{ __( 'Conclusion', 'yokoi' ) }</li>
										</ul>
									) }
									<div className="wp-block-yokoi-navygator__preview-note">
										{ __( 'Desktop: Floating sidebar on the right', 'yokoi' ) }
										<br />
										{ __( 'Mobile: Toggle button with slide-up drawer', 'yokoi' ) }
									</div>
								</>
							) }
						</div>
					</div>
				</div>
			</div>
		</>
	);
}


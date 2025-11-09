import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';

import './editor.scss';

const CozyModePlaceholder = ( { label, helperText, showHelperText } ) => {
	return (
		<div className="yokoi-cozy-mode-editor-card">
			<div className="yokoi-cozy-mode-editor-icon" aria-hidden="true">
				📖
			</div>
			<div className="yokoi-cozy-mode-editor-content">
				<RichText
					tagName="div"
					className="yokoi-cozy-mode-editor-label"
					value={ label }
					allowedFormats={ [] }
					onChange={ () => {} }
					placeholder={ __( 'Read in Cozy Mode', 'yokoi' ) }
					disabled
				/>
				{ showHelperText && (
					<div className="yokoi-cozy-mode-editor-helper">
						{ helperText }
					</div>
				) }
			</div>
		</div>
	);
};

const Edit = ( { attributes, setAttributes } ) => {
	const { buttonLabel, helperText, showHelperText } = attributes;
	const blockProps = useBlockProps( {
		className: 'yokoi-cozy-mode-block',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Button Text', 'yokoi' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Label', 'yokoi' ) }
						value={ buttonLabel }
						onChange={ ( value ) =>
							setAttributes( { buttonLabel: value } )
						}
						placeholder={ __( 'Read in Cozy Mode', 'yokoi' ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Helper Text', 'yokoi' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Show helper text', 'yokoi' ) }
						checked={ showHelperText }
						onChange={ ( value ) =>
							setAttributes( { showHelperText: value } )
						}
					/>

					{ showHelperText && (
						<TextControl
							label={ __( 'Helper text', 'yokoi' ) }
							value={ helperText }
							onChange={ ( value ) =>
								setAttributes( { helperText: value } )
							}
							placeholder={ __(
								'Opens a focused reading interface with clean typography.',
								'yokoi'
							) }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<CozyModePlaceholder
					label={ buttonLabel }
					helperText={ helperText }
					showHelperText={ showHelperText }
				/>
			</div>
		</>
	);
};

export default Edit;


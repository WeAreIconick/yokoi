import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';

import './editor.scss';

const CozyModePlaceholder = ( { label, helperText, showHelperText } ) => (
	<div className="yokoi-cozy-mode-preview">
		<div className="cozy-mode-button-container cozy-mode-button-container--preview">
			<button type="button" className="cozy-mode-toggle" disabled>
				<span className="cozy-mode-icon" aria-hidden="true">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4 6H20M4 12H20M4 18H14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
				<span className="cozy-mode-toggle__label">
					{ label || __( 'Read in Cozy Mode', 'yokoi' ) }
				</span>
			</button>
			{ showHelperText && helperText && (
				<span className="cozy-mode-toggle__helper">{ helperText }</span>
			) }
		</div>

		<div className="yokoi-cozy-mode-preview__modal">
			<header className="yokoi-cozy-mode-preview__modal-header">
				<span className="yokoi-cozy-mode-preview__modal-title">
					{ __( 'Reading Mode', 'yokoi' ) }
				</span>
				<span className="yokoi-cozy-mode-preview__modal-close" aria-hidden="true">
					&times;
				</span>
			</header>
			<div className="yokoi-cozy-mode-preview__modal-body">
				<p>
					{ __(
						'Cozy Mode reflows your content with research-backed typography for a delightful reading experience.',
						'yokoi'
					) }
				</p>
				<p>
					{ __(
						'Readers can toggle dark mode, adjust font size, and stay focused on the words that matter.',
						'yokoi'
					) }
				</p>
			</div>
			<footer className="yokoi-cozy-mode-preview__modal-controls">
				<span className="yokoi-cozy-mode-preview__control">A-</span>
				<span className="yokoi-cozy-mode-preview__control">A</span>
				<span className="yokoi-cozy-mode-preview__control">A+</span>
				<span className="yokoi-cozy-mode-preview__control">🌙</span>
				<span className="yokoi-cozy-mode-preview__control">🖨️</span>
			</footer>
		</div>
	</div>
);

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


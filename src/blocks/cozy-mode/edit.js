import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';

import './editor.scss';

const CozyModePlaceholder = ( { label } ) => (
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
		</div>
	</div>
);

const Edit = ( { attributes, setAttributes } ) => {
	const { buttonLabel } = attributes;
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
			</InspectorControls>

			<div { ...blockProps }>
				<CozyModePlaceholder
					label={ buttonLabel }
				/>
			</div>
		</>
	);
};

export default Edit;


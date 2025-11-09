import { Panel, PanelBody, PanelRow, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BlockTogglePanel = ( {
	blocksEnabled = {},
	blockDefinitions = {},
	onToggle,
} ) => {
	const orderedKeys = Object.keys( blockDefinitions ).length
		? Object.keys( blockDefinitions )
		: Object.keys( blocksEnabled );
	const entries = orderedKeys.map( ( key ) => [
		key,
		blocksEnabled?.[ key ] ?? true,
	] );

	return (
		<Panel>
			<PanelBody
				title={ __( 'Enable/Disable Blocks', 'yokoi' ) }
				initialOpen={ true }
			>
				{ entries.length === 0 && (
					<PanelRow className="yokoi-sidebar__panel-row yokoi-sidebar__panel-row--empty">
						<p className="yokoi-sidebar__empty">
							{ __(
								'No blocks registered yet. Blocks will appear here once available.',
								'yokoi'
							) }
						</p>
					</PanelRow>
				) }

				{ entries.map( ( [ blockName, enabled ] ) => {
					const label = blockDefinitions[ blockName ]?.title || blockName;
					const description = blockDefinitions[ blockName ]?.description;

					return (
						<PanelRow key={ blockName } className="yokoi-sidebar__panel-row">
							<ToggleControl
								label={ label }
								checked={ Boolean( enabled ) }
								onChange={ () => onToggle( blockName ) }
								help={ description }
							/>
						</PanelRow>
					);
				} ) }
			</PanelBody>
		</Panel>
	);
};

export default BlockTogglePanel;

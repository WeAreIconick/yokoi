import {
	Panel,
	PanelBody,
	PanelRow,
	ToggleControl,
	SearchControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BlockTogglePanel = ( {
	isLoading = false,
	error = null,
	searchValue = '',
	onSearchChange = () => {},
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

	const searchTerm = searchValue?.toLowerCase?.() ?? '';

	const filteredEntries = entries.filter( ( [ blockName ] ) => {
		if ( ! searchTerm ) {
			return true;
		}

		const label = blockDefinitions[ blockName ]?.title || blockName;
		const description = blockDefinitions[ blockName ]?.description || '';
		const haystack = `${ label } ${ description }`.toLowerCase();

		return haystack.includes( searchTerm );
	} );

	return (
		<Panel>
			<PanelBody
				title={ __( 'Enable/Disable Blocks', 'yokoi' ) }
				initialOpen={ true }
			>
				<SearchControl
					value={ searchValue }
					onChange={ onSearchChange }
					placeholder={ __( 'Search blocks…', 'yokoi' ) }
				/>

				{ isLoading && (
					<PanelRow className="yokoi-sidebar__panel-row">
						<p className="yokoi-sidebar__loading-message">
							{ __( 'Loading block catalog…', 'yokoi' ) }
						</p>
					</PanelRow>
				) }

				{ error && ! isLoading && (
					<PanelRow className="yokoi-sidebar__panel-row">
						<p className="yokoi-sidebar__error">
							{ error?.message ||
								__(
									'Unable to load block catalog.',
									'yokoi'
								) }
						</p>
					</PanelRow>
				) }

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

				{ ! isLoading && filteredEntries.length === 0 && entries.length > 0 && (
					<PanelRow className="yokoi-sidebar__panel-row yokoi-sidebar__panel-row--empty">
						<p className="yokoi-sidebar__empty">
							{ __(
								'No blocks match your search.',
								'yokoi'
							) }
						</p>
					</PanelRow>
				) }

				{ filteredEntries.map( ( [ blockName, enabled ] ) => {
					const label = blockDefinitions[ blockName ]?.title || blockName;
					const description = blockDefinitions[ blockName ]?.description;

					return (
						<PanelRow key={ blockName } className="yokoi-sidebar__panel-row">
							<ToggleControl
								label={ label }
								checked={ Boolean( enabled ) }
								onChange={ () => onToggle( blockName ) }
								help={ description }
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					);
				} ) }
			</PanelBody>
		</Panel>
	);
};

export default BlockTogglePanel;

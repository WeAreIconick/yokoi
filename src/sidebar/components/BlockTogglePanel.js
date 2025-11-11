import {
	Button,
	Notice,
	Panel,
	PanelBody,
	SearchControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BlockTogglePanel = ( {
	isLoading = false,
	isLoadingMore = false,
	error = null,
	searchValue = '',
	onSearchChange = () => {},
	blocksEnabled = {},
	blockDefinitions = {},
	onToggle,
	hasMore = false,
	onLoadMore = () => {},
	disabled = false,
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
					disabled={ disabled }
				/>

				{ isLoading && (
					<>
						<Spinner />
						<span>{ __( 'Loading block catalog…', 'yokoi' ) }</span>
					</>
				) }

				{ error && ! isLoading && (
					<Notice status="error">
						{ error?.message ||
							__( 'Unable to load block catalog.', 'yokoi' ) }
					</Notice>
				) }

				{ entries.length === 0 && (
					<p>
						{ __(
							'No blocks registered yet. Blocks will appear here once available.',
							'yokoi'
						) }
					</p>
				) }

				{ ! isLoading &&
					filteredEntries.length === 0 &&
					entries.length > 0 && (
						<p>{ __( 'No blocks match your search.', 'yokoi' ) }</p>
					) }

				{ filteredEntries.map( ( [ blockName, enabled ] ) => {
					const label = blockDefinitions[ blockName ]?.title || blockName;
					const description = blockDefinitions[ blockName ]?.description;
					return (
						<ToggleControl
							key={ blockName }
							label={ label }
							checked={ Boolean( enabled ) }
							onChange={ () => onToggle( blockName ) }
							help={ description }
							__nextHasNoMarginBottom
							disabled={ disabled }
						/>
					);
				} ) }

				{ hasMore && ! isLoading && (
					<Button
						variant="secondary"
						onClick={ onLoadMore }
						isBusy={ isLoadingMore }
						disabled={ isLoadingMore || disabled }
					>
						{ isLoadingMore
							? __( 'Loading…', 'yokoi' )
							: __( 'Load more blocks', 'yokoi' ) }
					</Button>
				) }
			</PanelBody>
		</Panel>
	);
};

export default BlockTogglePanel;

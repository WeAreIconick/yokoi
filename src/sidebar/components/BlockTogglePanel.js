import {
	Button,
	Notice,
	Panel,
	PanelBody,
	SearchControl,
	Spinner,
	ToggleControl,
	Flex,
	ToolbarButton,
	ToolbarGroup,
	Popover,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { star, starFilled, undo, redo, external } from '@wordpress/icons';
import { useState } from '@wordpress/element';

const BlockTogglePanel = ( {
	isLoading = false,
	isLoadingMore = false,
	error = null,
	searchValue = '',
	onSearchChange = () => {},
	searchHistory = [],
	blocksEnabled = {},
	blockDefinitions = {},
	onToggle,
	onToggleAll = null,
	onToggleFavorite = null,
	favoriteBlocks = new Set(),
	togglingBlocks = new Set(),
	hasMore = false,
	onLoadMore = () => {},
	onRetry = null,
	canUndo = false,
	canRedo = false,
	onUndo = null,
	onRedo = null,
	blockStatistics = {},
	onPreviewBlock = null,
	validationErrors = {},
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

	// Sort: favorites first, then alphabetically.
	const sortedEntries = [ ...entries ].sort( ( [ a ], [ b ] ) => {
		const aFavorite = favoriteBlocks.has( a );
		const bFavorite = favoriteBlocks.has( b );
		if ( aFavorite && ! bFavorite ) return -1;
		if ( ! aFavorite && bFavorite ) return 1;
		const aLabel = blockDefinitions[ a ]?.title || a;
		const bLabel = blockDefinitions[ b ]?.title || b;
		return aLabel.localeCompare( bLabel );
	} );

	const filteredEntries = sortedEntries.filter( ( [ blockName ] ) => {
		if ( ! searchTerm ) {
			return true;
		}

		const label = blockDefinitions[ blockName ]?.title || blockName;
		const description = blockDefinitions[ blockName ]?.description || '';
		const haystack = `${ label } ${ description }`.toLowerCase();

		return haystack.includes( searchTerm );
	} );

	const enabledCount = filteredEntries.filter( ( [ , enabled ] ) => enabled ).length;
	const totalCount = filteredEntries.length;
	const allEnabled = totalCount > 0 && enabledCount === totalCount;
	const allDisabled = totalCount > 0 && enabledCount === 0;

	return (
		<Panel>
			<PanelBody
				title={ __( 'Enable/Disable Blocks', 'yokoi' ) }
				initialOpen={ true }
			>
				<Flex direction="column" gap={ 3 }>
					<Flex direction="column" gap={ 2 }>
						<SearchControl
							value={ searchValue }
							onChange={ onSearchChange }
							placeholder={ __( 'Search blocks… (⌘K)', 'yokoi' ) }
							disabled={ disabled }
							__nextHasNoMarginBottom
							aria-label={ __( 'Search blocks', 'yokoi' ) }
							aria-describedby="yokoi-search-description"
						/>
						<span id="yokoi-search-description" className="screen-reader-text">
							{ __( 'Search for blocks by name or description. Use arrow keys to navigate results.', 'yokoi' ) }
						</span>
						{ searchHistory.length > 0 && ! searchValue && (
							<Flex gap={ 1 } wrap>
								{ searchHistory.slice( 0, 5 ).map( ( term ) => (
									<Button
										key={ term }
										variant="tertiary"
										size="small"
										onClick={ () => onSearchChange( term ) }
									>
										{ term }
									</Button>
								) ) }
							</Flex>
						) }
					</Flex>

					{ ( onUndo || onRedo ) && (
						<ToolbarGroup>
							{ onUndo && (
								<ToolbarButton
									icon={ undo }
									label={ __( 'Undo', 'yokoi' ) }
									onClick={ onUndo }
									disabled={ ! canUndo || disabled }
								/>
							) }
							{ onRedo && (
								<ToolbarButton
									icon={ redo }
									label={ __( 'Redo', 'yokoi' ) }
									onClick={ onRedo }
									disabled={ ! canRedo || disabled }
								/>
							) }
						</ToolbarGroup>
					) }

					{ onToggleAll && totalCount > 0 && (
						<Flex gap={ 2 }>
							<Button
								variant="secondary"
								size="small"
								onClick={ () => onToggleAll( true ) }
								disabled={ disabled || allEnabled || isLoading }
							>
								{ __( 'Enable All', 'yokoi' ) }
							</Button>
							<Button
								variant="secondary"
								size="small"
								onClick={ () => onToggleAll( false ) }
								disabled={ disabled || allDisabled || isLoading }
							>
								{ __( 'Disable All', 'yokoi' ) }
							</Button>
							{ totalCount > 0 && (
								<span style={ { marginLeft: 'auto', fontSize: '12px', color: '#757575' } }>
									{ enabledCount } / { totalCount } { __( 'enabled', 'yokoi' ) }
								</span>
							) }
						</Flex>
					) }

					{ isLoading && (
						<Flex direction="column" gap={ 2 }>
							<Flex align="center" gap={ 2 }>
								<Spinner />
								<span>{ __( 'Loading block catalog…', 'yokoi' ) }</span>
							</Flex>
							{ /* Loading skeleton */ }
							{ [ 1, 2, 3 ].map( ( i ) => (
								<Flex key={ i } align="center" gap={ 2 } style={ { opacity: 0.5 } }>
									<div style={ { width: '40px', height: '20px', background: '#ddd', borderRadius: '2px' } } />
									<div style={ { flex: 1, height: '16px', background: '#eee', borderRadius: '2px' } } />
								</Flex>
							) ) }
						</Flex>
					) }

					{ error && ! isLoading && (
						<Notice
							status="error"
							isDismissible={ false }
							actions={ onRetry ? [
								{
									label: __( 'Retry', 'yokoi' ),
									onClick: onRetry,
								},
							] : [] }
						>
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
						const BlockItem = ( { blockName: name, enabled: isEnabled } ) => {
							const [ showPreview, setShowPreview ] = useState( false );
							const label = blockDefinitions[ name ]?.title || name;
							const description = blockDefinitions[ name ]?.description;
							const isToggling = togglingBlocks.has( name );
							const isFavorite = favoriteBlocks.has( name );
							const stats = blockStatistics[ name ] || {};
							const usageCount = stats.usage_count || 0;
							const postCount = stats.post_count || 0;

							return (
								<Flex key={ name } align="center" gap={ 2 } style={ { position: 'relative' } }>
									{ onToggleFavorite && (
										<Button
											icon={ isFavorite ? starFilled : star }
											label={ isFavorite ? __( 'Remove from favorites', 'yokoi' ) : __( 'Add to favorites', 'yokoi' ) }
											onClick={ () => onToggleFavorite( name ) }
											variant="tertiary"
											size="small"
											style={ { minWidth: '32px', padding: '4px' } }
											aria-label={ isFavorite ? __( 'Remove from favorites', 'yokoi' ) : __( 'Add to favorites', 'yokoi' ) }
										/>
									) }
									<Flex direction="column" gap={ 0 } style={ { flex: 1 } }>
										<ToggleControl
											label={ label }
											checked={ Boolean( isEnabled ) }
											onChange={ () => onToggle( name ) }
											help={ description }
											__nextHasNoMarginBottom
											disabled={ disabled || isToggling }
											aria-describedby={ `yokoi-block-${ name }-description` }
											aria-invalid={ validationErrors[ name ] ? 'true' : undefined }
											aria-errormessage={ validationErrors[ name ] ? `yokoi-error-${ name }` : undefined }
										/>
										{ validationErrors[ name ] && (
											<span
												id={ `yokoi-error-${ name }` }
												role="alert"
												style={ { fontSize: '12px', color: '#d63638', marginLeft: '48px', marginTop: '-4px' } }
											>
												{ validationErrors[ name ] }
											</span>
										) }
										<Flex gap={ 2 } style={ { marginTop: '-8px', marginLeft: '48px', fontSize: '11px', color: '#757575' } }>
											{ usageCount > 0 && (
												<span id={ `yokoi-block-${ name }-stats` } aria-label={ __( 'Usage statistics', 'yokoi' ) }>
													{ usageCount } { __( 'uses', 'yokoi' ) }
												</span>
											) }
											{ postCount > 0 && (
												<span aria-label={ __( 'Post count', 'yokoi' ) }>
													{ postCount } { __( 'posts', 'yokoi' ) }
												</span>
											) }
											{ onPreviewBlock && (
												<Button
													icon={ external }
													label={ __( 'Preview block', 'yokoi' ) }
													onClick={ () => setShowPreview( ! showPreview ) }
													variant="tertiary"
													size="small"
													style={ { height: '20px', padding: '2px 4px' } }
													aria-expanded={ showPreview }
													aria-controls={ `yokoi-preview-${ name }` }
												/>
											) }
										</Flex>
										{ showPreview && onPreviewBlock && (
											<Popover
												id={ `yokoi-preview-${ name }` }
												onClose={ () => setShowPreview( false ) }
												role="dialog"
												aria-label={ __( 'Block preview', 'yokoi' ) }
											>
												<div style={ { padding: '16px', minWidth: '300px', maxWidth: '500px' } }>
													<h3 style={ { marginTop: 0 } }>{ label }</h3>
													<p>{ description || __( 'No description available.', 'yokoi' ) }</p>
													<Button
														variant="primary"
														onClick={ () => {
															onPreviewBlock( name );
															setShowPreview( false );
														} }
													>
														{ __( 'View Demo', 'yokoi' ) }
													</Button>
												</div>
											</Popover>
										) }
									</Flex>
									{ isToggling && <Spinner size={ 16 } aria-label={ __( 'Saving…', 'yokoi' ) } /> }
								</Flex>
							);
						};

						return <BlockItem key={ blockName } blockName={ blockName } enabled={ enabled } />;
					} ) }
				</Flex>

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

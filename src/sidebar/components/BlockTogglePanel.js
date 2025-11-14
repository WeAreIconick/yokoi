import {
	Button,
	Card,
	CardBody,
	Notice,
	SearchControl,
	Spinner,
	ToggleControl,
	Flex,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starEmpty, starFilled, update } from '@wordpress/icons';
import { useState } from '@wordpress/element';

const BlockTogglePanel = ( {
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
	blockStatistics = {},
	validationErrors = {},
	disabled = false,
	onRefreshInserter = null,
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
		<Card>
			<CardBody>
				<Flex direction="column" gap={ 4 }>
					<Notice
						status="info"
						isDismissible={ false }
						className="yokoi-block-toggle-notice"
					>
						{ __( 'Changes are saved immediately. If a block doesn\'t appear or disappear in the inserter right away, click "Refresh Inserter" below or close and reopen the block inserter.', 'yokoi' ) }
					</Notice>

					<Button
						variant="secondary"
						size="small"
						icon={ update }
						onClick={ onRefreshInserter || ( () => {} ) }
						disabled={ disabled || ! onRefreshInserter }
					>
						{ __( 'Refresh Block Inserter', 'yokoi' ) }
					</Button>

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

			{ onToggleAll && totalCount > 0 && (
				<Flex gap={ 2 }>
					<Button
						variant="secondary"
						size="small"
						onClick={ () => onToggleAll( true ) }
						disabled={ disabled || allEnabled }
					>
						{ __( 'Enable All', 'yokoi' ) }
					</Button>
					<Button
						variant="secondary"
						size="small"
						onClick={ () => onToggleAll( false ) }
						disabled={ disabled || allDisabled }
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

			{ error && (
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

			{ filteredEntries.length === 0 &&
				entries.length > 0 && (
					<p>{ __( 'No blocks match your search.', 'yokoi' ) }</p>
				) }

			{ filteredEntries.map( ( [ blockName, enabled ] ) => {
				const BlockItem = ( { blockName: name, enabled: isEnabled } ) => {
					const label = blockDefinitions[ name ]?.title || name;
					const description = blockDefinitions[ name ]?.description;
					const isToggling = togglingBlocks.has( name );
					const isFavorite = favoriteBlocks.has( name );
					const stats = blockStatistics[ name ] || {};
					const usageCount = stats.usage_count || 0;
					const postCount = stats.post_count || 0;
					
					return (
						<Flex key={ name } align="flex-start" gap={ 2 } style={ { position: 'relative' } }>
							<Flex direction="column" gap={ 0 } style={ { flex: 1, minWidth: 0 } }>
								<Flex align="center" justify="space-between" gap={ 2 }>
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
									{ onToggleFavorite && (
										<Button
											icon={ isFavorite ? starFilled : starEmpty }
											onClick={ () => onToggleFavorite( name ) }
											variant="tertiary"
											size="small"
											style={ { 
												minWidth: '24px', 
												width: '24px',
												height: '24px',
												padding: 0,
												flexShrink: 0,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center'
											} }
											aria-label={ isFavorite ? __( 'Remove from favorites', 'yokoi' ) : __( 'Add to favorites', 'yokoi' ) }
										/>
									) }
								</Flex>
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
								</Flex>
							</Flex>
							{ isToggling && <Spinner size={ 16 } aria-label={ __( 'Saving…', 'yokoi' ) } /> }
						</Flex>
					);
				};

				return <BlockItem key={ blockName } blockName={ blockName } enabled={ enabled } />;
			} ) }

			{ hasMore && (
				<Button
					variant="secondary"
					onClick={ onLoadMore }
					disabled={ disabled }
				>
					{ __( 'Load more blocks', 'yokoi' ) }
				</Button>
			) }
				</Flex>
			</CardBody>
		</Card>
	);
};

export default BlockTogglePanel;

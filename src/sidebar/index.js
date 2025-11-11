import { registerPlugin } from '@wordpress/plugins';
import { Button, Flex, Notice, Spinner, TabPanel, TextControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { addQueryArgs } from '@wordpress/url';
import isEqual from 'lodash/isEqual';

import BlockTogglePanel from './components/BlockTogglePanel';
import './style.scss';

const logDebug = ( ...args ) => {
	if ( window?.YOKOI_DEBUG ) {
		// eslint-disable-next-line no-console
		console.info( '[Yokoi]', ...args );
	}
};

const bootstrap = window.yokoiSettings || {};
const initialBlockList = Array.isArray( bootstrap.blocks ) ? bootstrap.blocks : [];
const CATALOG_PAGE_SIZE = 100;
const SIDEBAR_PLUGIN_SLUG = 'yokoi-settings-sidebar';

const shouldAutoOpenSidebar = () => {
	try {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'yokoi_sidebar' ) === '1';
	} catch ( error ) {
		return false;
	}
};

const openSidebar = () => {
	const data = window?.wp?.data;

	if ( ! data?.dispatch ) {
		return;
	}

	const editSiteDispatch = data.dispatch( 'core/edit-site' );

	if ( editSiteDispatch?.openGeneralSidebar ) {
		editSiteDispatch.openGeneralSidebar(
			`edit-site/plugin-sidebar/${ SIDEBAR_PLUGIN_SLUG }`
		);
		return;
	}

	const editPostDispatch = data.dispatch( 'core/edit-post' );

	if ( editPostDispatch?.openGeneralSidebar ) {
		editPostDispatch.openGeneralSidebar(
			`edit-post/plugin-sidebar/${ SIDEBAR_PLUGIN_SLUG }`
		);
	}
};

const scheduleSidebarOpen = () => {
	if ( ! shouldAutoOpenSidebar() ) {
		return;
	}

	let attempts = 5;

	const tick = () => {
		openSidebar();
		attempts -= 1;

		if ( attempts > 0 ) {
			window.setTimeout( tick, 300 );
		}
	};

	window.setTimeout( tick, 150 );
};

const toDefinitionMap = ( list = [] ) =>
	list.reduce( ( acc, block ) => {
		if ( block?.name ) {
			acc[ block.name ] = block;
		}
		return acc;
	}, {} );

const buildDefaultSettings = ( definitions = {} ) => ( {
	blocks_enabled: Object.fromEntries(
		Object.keys( definitions ).map( ( name ) => [ name, true ] )
	),
	default_configs: {},
	visibility_controls: {},
	date_now_api_key: '',
} );

const sanitizeSettingsWithDefinitions = ( value, definitions ) => {
	const defaults = buildDefaultSettings( definitions );
	const output = {
		...defaults,
		...( value || {} ),
	};

	output.blocks_enabled = {
		...defaults.blocks_enabled,
		...( value?.blocks_enabled || {} ),
	};

	Object.keys( definitions ).forEach( ( blockName ) => {
		if ( typeof output.blocks_enabled[ blockName ] !== 'boolean' ) {
			output.blocks_enabled[ blockName ] = Boolean(
				defaults.blocks_enabled[ blockName ]
			);
		}
	} );

	output.default_configs = {
		...defaults.default_configs,
		...( value?.default_configs || {} ),
	};

	output.visibility_controls = {
		...defaults.visibility_controls,
		...( value?.visibility_controls || {} ),
	};

	output.date_now_api_key =
		typeof value?.date_now_api_key === 'string'
			? value.date_now_api_key
			: defaults.date_now_api_key;

	return output;
};

const broadcastSettingsUpdate = ( nextSettings ) => {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.yokoiSettings = {
		...( window.yokoiSettings || {} ),
		settings: nextSettings,
	};

	window.dispatchEvent(
		new CustomEvent( 'yokoi:settings-updated', { detail: nextSettings } )
	);
};

if ( bootstrap?.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( bootstrap.nonce ) );
}

let SitePluginSidebar = null;
let SitePluginSidebarMoreMenuItem = null;

const YokoiSidebarIcon = ( props = {} ) => (
	<svg
		className="yokoi-sidebar__icon"
		width="20"
		height="20"
		viewBox="0 0 163.3 163.3"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
		{ ...props }
	>
		<path
			d="M145.1,38.5c0-1.2-.9-2.1-2.1-2.1H20.3c-1.2,0-2.1.9-2.1,2.1v104.4c0,1.2.9,2.1,2.1,2.1h122.7c1.2,0,2.1-.9,2.1-2.1V38.5ZM0,161.9V1.5C.6.5,1.8,0,3.5,0,51.6,0,98.1,0,143.1,0c1.2,0,2.1.9,2.1,2.1v13.9c0,1.2.9,2.1,2.1,2.2.6,0,5.2,0,13.9,0,1.4,0,2.1.8,2.1,2.4,0,3.5,0,50,0,139.5,0,2.2-.6,3.1-2.8,3.1-53,0-105.9,0-158.9,0,0,0-.2,0-.2,0l-1.4-1.3"
			fill="currentColor"
		/>
		<path
			d="M75.2,86.9c0,1.2-.9,2.1-2.1,2.1h-8.8c-1.2,0-2.1-1-2.1-2.1v-18.2c0-1.2,1-2.1,2.1-2.1h8.8c1.2,0,2.1,1,2.1,2.1v18.2Z"
			fill="currentColor"
		/>
		<path
			d="M101.1,86.9c0,1.2-.9,2.1-2.1,2.1h-8.8c-1.2,0-2.1-.9-2.1-2.1v-18.2c0-1.2.9-2.1,2.1-2.1h8.8c1.2,0,2.1.9,2.1,2.1v18.2Z"
			fill="currentColor"
		/>
		<path
			d="M81.6,101.8c19.6,0,29.5,0,29.7,0,1.1,0,1.9-.9,1.9-2v-8.1c0-1.1.9-2,2-2h9c1.1,0,2,.9,2,2v8.9c0,1.1-.9,2.1-2.1,2.1h-8.2c-1.1,0-1.9.8-1.9,1.9v8.1c0,1.1-.9,1.9-1.9,2,0,0-10.2,0-30.5,0-20.3,0-30.5,0-30.5,0-1.1,0-1.9-1-1.9-2v-8.1c0-1-.9-1.9-2-1.9h-8.2c-1.1,0-2.1-.9-2.1-2.1v-8.9c0-1.1.9-2,2-2h9c1.1,0,2,.9,2,2v8.1c0,1.1.9,1.9,1.9,2,.2,0,10,0,29.7,0Z"
			fill="currentColor"
		/>
	</svg>
);

const YokoiSidebar = () => {
	if ( ! SitePluginSidebar || ! SitePluginSidebarMoreMenuItem ) {
		return null;
	}

	const [ blockDefinitions, setBlockDefinitions ] = useState( () =>
		toDefinitionMap( initialBlockList )
	);
	const [ isBlockCatalogLoading, setIsBlockCatalogLoading ] = useState( false );
	const [ blockCatalogError, setBlockCatalogError ] = useState( null );
	const [ searchTerm, setSearchTerm ] = useState( '' );
const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState( '' );
const [ catalogMeta, setCatalogMeta ] = useState( {
	page: 0,
	totalPages: 0,
	search: '',
} );
const [ isCatalogLoadingMore, setIsCatalogLoadingMore ] = useState( false );

useEffect( () => {
	const handle = setTimeout( () => {
		setDebouncedSearchTerm( searchTerm );
	}, 300 );

	return () => clearTimeout( handle );
}, [ searchTerm ] );

	const optionName = bootstrap?.settingsOption || 'yokoi_settings';
	const canManage = bootstrap?.capabilities?.canManage !== false;
	const blocksEndpoint = bootstrap?.blocksEndpoint;
	const { editEntityRecord } = useDispatch( 'core' );

	const {
		optionValue,
		persistedOptionValue,
		optionDirty,
		optionResolving,
		optionSaving,
	} = useSelect(
		( select ) => {
			const coreStore = select( 'core' );
			const record = coreStore.getEntityRecord(
				'root',
				'option',
				optionName
			);
			const editedRecord = coreStore.getEditedEntityRecord
				? coreStore.getEditedEntityRecord(
						'root',
						'option',
						optionName
				  )
				: null;

			const hasEditedValue =
				editedRecord &&
				Object.prototype.hasOwnProperty.call( editedRecord, 'value' );

			return {
				optionValue: hasEditedValue ? editedRecord.value : record?.value,
				persistedOptionValue: record?.value,
				optionDirty: coreStore.hasEditsForEntityRecord
					? coreStore.hasEditsForEntityRecord(
							'root',
							'option',
							optionName
					  )
					: false,
				optionResolving: coreStore.isResolving
					? coreStore.isResolving( 'getEntityRecord', [
							'root',
							'option',
							optionName,
					  ] )
					: false,
				optionSaving: coreStore.isSavingEntityRecord
					? coreStore.isSavingEntityRecord(
							'root',
							'option',
							optionName
					  )
					: false,
			};
		},
		[ optionName ]
	);

	const hasFetchedOption = typeof optionValue !== 'undefined' || typeof persistedOptionValue !== 'undefined';
	const baseOptionValue =
		typeof optionValue !== 'undefined'
			? optionValue
			: typeof persistedOptionValue !== 'undefined'
				? persistedOptionValue
				: bootstrap.settings ?? buildDefaultSettings( blockDefinitions );

	const normalizedOptionValue = useMemo(
		() =>
			sanitizeSettingsWithDefinitions(
				baseOptionValue,
				blockDefinitions
			),
		[ baseOptionValue, blockDefinitions ]
	);

	const hasSeededFromPersistedRef = useRef( false );

	useEffect( () => {
		logDebug( 'Option status', {
			optionValue,
			persistedOptionValue,
			hasFetchedOption,
		} );
	}, [ optionValue, persistedOptionValue, hasFetchedOption ] );

	useEffect( () => {
		if (
			! hasSeededFromPersistedRef.current &&
			typeof optionValue === 'undefined' &&
			typeof persistedOptionValue !== 'undefined'
		) {
			const sanitizedPersisted = sanitizeSettingsWithDefinitions(
				persistedOptionValue,
				blockDefinitions
			);

			logDebug( 'Seeding edited option with persisted value' );
			hasSeededFromPersistedRef.current = true;
			editEntityRecord( 'root', 'option', optionName, {
				value: sanitizedPersisted,
			} );
			return;
		}

		if (
			typeof optionValue !== 'undefined' &&
			! isEqual( optionValue, normalizedOptionValue )
		) {
			logDebug( 'Syncing edited option to normalized snapshot' );
			editEntityRecord( 'root', 'option', optionName, {
				value: normalizedOptionValue,
			} );
		}
	}, [
		optionValue,
		persistedOptionValue,
		normalizedOptionValue,
		optionName,
		editEntityRecord,
		blockDefinitions,
	] );

	useEffect( () => {
		broadcastSettingsUpdate( normalizedOptionValue );
	}, [ normalizedOptionValue ] );

	const isInitialLoad = ! hasFetchedOption;
	const isOptionReady = hasFetchedOption;
	const isLoading = isBlockCatalogLoading && isOptionReady;
	const blocksEnabled = normalizedOptionValue.blocks_enabled || {};
	const dateNowApiKey = normalizedOptionValue.date_now_api_key || '';

	const applySettingsChange = useCallback(
		( updater ) => {
			if ( ! isOptionReady ) {
				logDebug( 'applySettingsChange bail: option not ready' );
				return;
			}

			const nextValue = sanitizeSettingsWithDefinitions(
				updater( normalizedOptionValue ),
				blockDefinitions
			);

			editEntityRecord( 'root', 'option', optionName, {
				value: nextValue,
			} );
		},
		[
			editEntityRecord,
			optionName,
			normalizedOptionValue,
			blockDefinitions,
			isOptionReady,
		]
	);

	const fetchBlockCatalog = useCallback(
		async ( { search = '', page = 1, append = false } = {} ) => {
			if ( ! blocksEndpoint ) {
				return;
			}

			setBlockCatalogError( null );

			if ( append ) {
				setIsCatalogLoadingMore( true );
			} else {
				setIsBlockCatalogLoading( true );
			}

			try {
				const requestUrl = addQueryArgs( blocksEndpoint, {
					per_page: CATALOG_PAGE_SIZE,
					page,
					...( search ? { search } : {} ),
				} );

				const response = await apiFetch( {
					url: requestUrl,
					method: 'GET',
					parse: false,
				} );

				const payload = await response.json();

				if ( ! response.ok ) {
					throw payload;
				}
				const total = parseInt(
					response.headers.get( 'X-WP-Total' ),
					10
				) || payload.length || 0;
				const totalPages =
					parseInt(
						response.headers.get( 'X-WP-TotalPages' ),
						10
					) || Math.max( 1, Math.ceil( total / CATALOG_PAGE_SIZE ) );
				const mapped = toDefinitionMap(
					Array.isArray( payload ) ? payload : []
				);

				let mergedDefinitions = mapped;
				setBlockDefinitions( ( previous ) => {
					mergedDefinitions = append
						? { ...previous, ...mapped }
						: mapped;
					return mergedDefinitions;
				} );

				setCatalogMeta( {
					page,
					totalPages,
					search,
				} );
			} catch ( err ) {
				setBlockCatalogError( err );
				if ( ! append ) {
					setCatalogMeta( {
						page: 0,
						totalPages: 0,
						search,
					} );
				}
			} finally {
				if ( append ) {
					setIsCatalogLoadingMore( false );
				} else {
					setIsBlockCatalogLoading( false );
				}
			}
		},
		[ blocksEndpoint ]
	);

	useEffect( () => {
		if ( ! blocksEndpoint ) {
			return;
		}

		fetchBlockCatalog( {
			search: debouncedSearchTerm,
			page: 1,
			append: false,
		} );
	}, [ blocksEndpoint, debouncedSearchTerm, fetchBlockCatalog ] );

	const toggleBlock = useCallback(
		( blockName ) => {
			applySettingsChange( ( current ) => ( {
				...current,
				blocks_enabled: {
					...current.blocks_enabled,
					[ blockName ]: ! current.blocks_enabled?.[ blockName ],
				},
			} ) );
		},
		[ applySettingsChange ]
	);

	const handleDateNowApiKeyChange = useCallback(
		( value ) => {
			applySettingsChange( ( current ) => ( {
				...current,
				date_now_api_key: value,
			} ) );
		},
		[ applySettingsChange ]
	);

	const hasMoreBlocks =
		catalogMeta.page > 0 && catalogMeta.page < catalogMeta.totalPages;

	const isDateNowEnabled =
		blocksEnabled?.[ 'yokoi/date-now' ] ?? true;

	const loadMoreBlocks = useCallback( () => {
		if ( ! blocksEndpoint ) {
			return;
		}

		if ( catalogMeta.page >= catalogMeta.totalPages ) {
			return;
		}

		fetchBlockCatalog( {
			search: catalogMeta.search,
			page: catalogMeta.page + 1,
			append: true,
		} );
	}, [ blocksEndpoint, catalogMeta, fetchBlockCatalog ] );

	const handleReset = useCallback( () => {
		if ( ! isOptionReady ) {
			return;
		}

		const baselineSource =
			persistedOptionValue ??
			bootstrap.settings ??
			buildDefaultSettings( blockDefinitions );

		const baseline = sanitizeSettingsWithDefinitions(
			baselineSource,
			blockDefinitions
		);

		editEntityRecord( 'root', 'option', optionName, {
			value: baseline,
		} );
	}, [
		persistedOptionValue,
		editEntityRecord,
		optionName,
		blockDefinitions,
		isOptionReady,
		bootstrap,
	] );

	const hasUnsavedChanges = optionDirty;
	const isSavingChanges = optionSaving;
	const isBusy = isSavingChanges || isBlockCatalogLoading;

	if ( ! canManage ) {
		return (
			<Fragment>
				<PluginSidebarMoreMenuItem
					target="yokoi-settings-sidebar"
					icon="admin-settings"
				>
					{ __( 'Yokoi Settings', 'yokoi' ) }
				</PluginSidebarMoreMenuItem>
				<PluginSidebar
					name="yokoi-settings-sidebar"
					title={ __( 'Yokoi Settings', 'yokoi' ) }
					icon="admin-settings"
				>
					<p>
						{ __(
							'You do not have permission to manage Yokoi settings.',
							'yokoi'
						) }
					</p>
				</PluginSidebar>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<SitePluginSidebarMoreMenuItem
				target="yokoi-settings-sidebar"
				icon={ <YokoiSidebarIcon /> }
			>
				{ __( 'Yokoi Settings', 'yokoi' ) }
			</SitePluginSidebarMoreMenuItem>
			<SitePluginSidebar
				name="yokoi-settings-sidebar"
				title={ __( 'Yokoi Settings', 'yokoi' ) }
				icon={ <YokoiSidebarIcon /> }
			>
				<Flex direction="column" gap={ 6 }>
					{ isInitialLoad ? (
						<div className="yokoi-sidebar__loading-shell">
							<div className="yokoi-sidebar__loading-panel">
								<Spinner />
								<p>{ __( 'Preparing Yokoi settings…', 'yokoi' ) }</p>
								<div className="yokoi-sidebar__loading-bar" />
								<div className="yokoi-sidebar__loading-bar yokoi-sidebar__loading-bar--short" />
							</div>
							<div className="yokoi-sidebar__loading-panel yokoi-sidebar__loading-panel--secondary">
								<div className="yokoi-sidebar__loading-bar" />
								<div className="yokoi-sidebar__loading-bar yokoi-sidebar__loading-bar--short" />
							</div>
						</div>
					) : (
						<>
							{ isLoading && (
								<Flex direction="column" gap={ 4 }>
									<Spinner />
									<p>{ __( 'Updating settings…', 'yokoi' ) }</p>
								</Flex>
							) }

							<Notice status="info" isDismissible={ false }>
								{ __(
									'Yokoi ships a suite of high-performance blocks built for modern WordPress sites. Use the controls below to enable blocks and fine-tune their behavior.',
									'yokoi'
								) }
							</Notice>

							<TabPanel
								initialTabName="catalog"
								tabs={ [
									{
										name: 'catalog',
										title: __( 'Blocks', 'yokoi' ),
									},
									{
										name: 'settings',
										title: __( 'Settings', 'yokoi' ),
									},
								] }
							>
								{ ( tab ) => {
									if ( tab.name === 'settings' ) {
										return (
											<Flex direction="column" gap={ 4 }>
												{ ! isDateNowEnabled ? (
													<Notice status="info" isDismissible={ false }>
														{ __(
															'Enable the Date.now block to configure Google Calendar access.',
															'yokoi'
														) }
													</Notice>
												) : (
													<TextControl
														label={ __(
															'Google Calendar API key',
															'yokoi'
														) }
														value={ dateNowApiKey }
														onChange={ handleDateNowApiKeyChange }
														placeholder={ __(
															'Paste your Google API key',
															'yokoi'
														) }
														help={ __(
															'Create a Maps Platform project, enable Calendar API access, and paste the key here.',
															'yokoi'
														) }
														disabled={ ! isOptionReady || isBusy }
													/>
												) }
											</Flex>
										);
									}

									return (
										<BlockTogglePanel
											isLoading={ isBlockCatalogLoading }
											isLoadingMore={ isCatalogLoadingMore }
											error={ blockCatalogError }
											searchValue={ searchTerm }
											onSearchChange={ setSearchTerm }
											hasMore={ hasMoreBlocks }
											onLoadMore={ loadMoreBlocks }
											blocksEnabled={ blocksEnabled }
											blockDefinitions={ blockDefinitions }
											onToggle={ toggleBlock }
											disabled={ ! isOptionReady || isBusy }
										/>
									);
								} }
							</TabPanel>

							<Flex justify="flex-end" gap={ 2 }>
								<Button
									variant="secondary"
									onClick={ handleReset }
									isBusy={ isBusy }
									disabled={
										isBusy || ! hasUnsavedChanges || ! isOptionReady
									}
								>
									{ __( 'Reset', 'yokoi' ) }
								</Button>
							</Flex>
						</>
					) }
				</Flex>
			</SitePluginSidebar>
		</Fragment>
	);
};

domReady( () => {
	const editorPackage = window?.wp?.editor;
	const editSite = window?.wp?.editSite;
	const bodyHasSiteEditorClass =
		document?.body?.classList?.contains( 'site-editor-php' ) ||
		document?.body?.classList?.contains( 'edit-site' );

	if ( ! editSite || ! bodyHasSiteEditorClass ) {
		return;
	}

	const source =
		editorPackage?.PluginSidebar && editorPackage?.PluginSidebarMoreMenuItem
			? editorPackage
			: editSite;

	const { PluginSidebar, PluginSidebarMoreMenuItem } = source || {};

	if ( ! PluginSidebar || ! PluginSidebarMoreMenuItem ) {
		return;
	}

	SitePluginSidebar = PluginSidebar;
	SitePluginSidebarMoreMenuItem = PluginSidebarMoreMenuItem;

	registerPlugin( 'yokoi-settings-sidebar', {
		render: YokoiSidebar,
		icon: YokoiSidebarIcon,
	} );

	scheduleSidebarOpen();
} );

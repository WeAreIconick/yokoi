import { registerPlugin } from '@wordpress/plugins';
import { Button, Card, CardBody, Flex, Notice, Spinner, TabPanel, TextControl } from '@wordpress/components';
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

const DEBUG_STORAGE_KEY = 'YOKOI_DEBUG';

const ensureDebugFlag = () => false;
const recordDebugLog = () => {};
const logDebug = () => {};

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
	const [ blockCatalogError, setBlockCatalogError ] = useState( null );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState( '' );
	const [ catalogMeta, setCatalogMeta ] = useState( {
		page: 0,
		totalPages: 0,
		search: '',
	} );
	const [ togglingBlocks, setTogglingBlocks ] = useState( new Set() );
	const [ favoriteBlocks, setFavoriteBlocks ] = useState( new Set() );
	const [ searchHistory, setSearchHistory ] = useState( [] );
	const [ settingsHistory, setSettingsHistory ] = useState( [] );
	const [ historyIndex, setHistoryIndex ] = useState( -1 );
	const [ blockStatistics, setBlockStatistics ] = useState( {} );
	const [ validationErrors, setValidationErrors ] = useState( {} );
	const [ localBlocksEnabled, setLocalBlocksEnabled ] = useState( null );
	const abortControllerRef = useRef( null );
	const pendingUpdatesRef = useRef( {} );
	const saveTimeoutRef = useRef( null );
	const activeRequestsRef = useRef( new Map() );
	const activeSaveRequestRef = useRef( null );

	// Define bootstrap variables early so they can be used in effects.
	const optionName = bootstrap?.settingsOption || 'yokoi_settings';
	const canManage = bootstrap?.capabilities?.canManage !== false;
	const blocksEndpoint = bootstrap?.blocksEndpoint;

	useEffect( () => {
		// Cancel previous request if it exists.
		if ( abortControllerRef.current ) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		const handle = setTimeout( () => {
			setDebouncedSearchTerm( searchTerm );
		}, 300 );

		return () => {
			clearTimeout( handle );
			controller.abort();
		};
	}, [ searchTerm ] );


	// Load favorites from localStorage.
	useEffect( () => {
		try {
			const stored = localStorage.getItem( 'yokoi_favorites' );
			if ( stored ) {
				setFavoriteBlocks( new Set( JSON.parse( stored ) ) );
			}
		} catch ( e ) {
			// Ignore errors.
		}
	}, [] );

	// Save favorites to localStorage.
	useEffect( () => {
		try {
			localStorage.setItem( 'yokoi_favorites', JSON.stringify( Array.from( favoriteBlocks ) ) );
		} catch ( e ) {
			// Ignore errors.
		}
	}, [ favoriteBlocks ] );

	// Fetch block statistics.
	useEffect( () => {
		if ( ! blocksEndpoint ) {
			return;
		}

		const fetchStats = async () => {
			try {
				const statsEndpoint = blocksEndpoint.replace( '/blocks', '/blocks/statistics' );
				const response = await apiFetch( { url: statsEndpoint } );
				if ( response && response.usage ) {
					const statsMap = {};
					Object.keys( response.usage ).forEach( ( blockName ) => {
						statsMap[ blockName ] = {
							usage_count: response.usage[ blockName ],
							last_used: response.last_used[ blockName ],
							post_count: response.post_count[ blockName ] ? response.post_count[ blockName ].length : 0,
						};
					} );
					setBlockStatistics( statsMap );
				}
			} catch ( err ) {
				// Ignore errors - statistics are optional.
			}
		};

		fetchStats();
	}, [ blocksEndpoint ] );

	// Keyboard shortcuts.
	useEffect( () => {
		const handleKeyDown = ( e ) => {
			// Cmd/Ctrl + K to focus search.
			if ( ( e.metaKey || e.ctrlKey ) && e.key === 'k' ) {
				e.preventDefault();
				const searchInput = document.querySelector( 'input[placeholder*="Search blocks"]' );
				if ( searchInput ) {
					searchInput.focus();
				}
			}

			// Escape to clear search.
			if ( e.key === 'Escape' && searchTerm ) {
				setSearchTerm( '' );
			}
		};

		window.addEventListener( 'keydown', handleKeyDown );
		return () => window.removeEventListener( 'keydown', handleKeyDown );
	}, [ searchTerm ] );

	const { editEntityRecord, receiveEntityRecords, saveEditedEntityRecord } = useDispatch( 'core' );

	// Undo/Redo handlers.
	const handleUndo = useCallback( () => {
		if ( historyIndex > 0 && settingsHistory[ historyIndex - 1 ] ) {
			const previousState = settingsHistory[ historyIndex - 1 ];
			setHistoryIndex( ( prev ) => prev - 1 );
			editEntityRecord( 'root', 'option', optionName, {
				value: previousState,
			} );
		}
	}, [ historyIndex, settingsHistory, editEntityRecord, optionName ] );

	const handleRedo = useCallback( () => {
		if ( historyIndex < settingsHistory.length - 1 && settingsHistory[ historyIndex + 1 ] ) {
			const nextState = settingsHistory[ historyIndex + 1 ];
			setHistoryIndex( ( prev ) => prev + 1 );
			editEntityRecord( 'root', 'option', optionName, {
				value: nextState,
			} );
		}
	}, [ historyIndex, settingsHistory, editEntityRecord, optionName ] );

	// Undo/Redo keyboard shortcuts.
	useEffect( () => {
		const handleUndoRedo = ( e ) => {
			// Cmd/Ctrl + Z for undo.
			if ( ( e.metaKey || e.ctrlKey ) && e.key === 'z' && ! e.shiftKey ) {
				e.preventDefault();
				if ( historyIndex > 0 ) {
					handleUndo();
				}
			}

			// Cmd/Ctrl + Shift + Z for redo.
			if ( ( e.metaKey || e.ctrlKey ) && e.shiftKey && e.key === 'Z' ) {
				e.preventDefault();
				if ( historyIndex < settingsHistory.length - 1 ) {
					handleRedo();
				}
			}
		};

		window.addEventListener( 'keydown', handleUndoRedo );
		return () => window.removeEventListener( 'keydown', handleUndoRedo );
	}, [ historyIndex, settingsHistory.length, handleUndo, handleRedo ] );
	const {
		__experimentalResolveSelect: resolveSelect,
		invalidateResolution,
	} = useDispatch( 'core/data' );
	const resolveEntityConfig = useCallback(
		( { invalidate = false } = {} ) => {
			if ( ! resolveSelect ) {
				return Promise.resolve();
			}

			const args = [ 'root', 'option', optionName ];

			if ( invalidate && invalidateResolution ) {
				invalidateResolution( 'core', 'getEntityRecord', args );
			}

			return resolveSelect( 'core', 'getEntityRecord', args ).catch(
				( error ) => {
					logDebug( 'Failed to resolve entity config', error );
				}
			);
		},
		[ resolveSelect, optionName, invalidateResolution ]
	);
	const {
		addEntities,
		receiveEntityRecords: receiveEntities,
		receiveEntityConfig,
	} = useDispatch( 'core' );
	const entityRegisteredRef = useRef( false );
	const settingsFetchRef = useRef( false );
	const pendingSeedRef = useRef( null );
	const pendingUpdatesQueueRef = useRef( [] );

	const {
		optionValue,
		persistedOptionValue,
		optionDirty,
		optionResolving,
		optionSaving,
		entityConfig,
		hasEntityConfigSelector,
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
				entityConfig: coreStore.getEntityConfig
					? coreStore.getEntityConfig(
							'root',
							'option',
							optionName
					  )
					: null,
				hasEntityConfigSelector:
					typeof coreStore.getEntityConfig === 'function',
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
	const hasSeededFallbackRef = useRef( false );
	const supportsEntityConfigSelector = hasEntityConfigSelector;
	const isEntityConfigReady = supportsEntityConfigSelector
		? Boolean( entityConfig )
		: true;
	const retrySeed = useCallback(
		( value, attempt = 0 ) => {
			const nextAttempt = attempt + 1;
			const delay = Math.min( 5000, nextAttempt * 1000 );
			window.setTimeout( () => {
				try {
					editEntityRecord( 'root', 'option', optionName, {
						value,
					} );
					logDebug(
						'Delayed seed succeeded',
						{ attempt: nextAttempt }
					);
					pendingSeedRef.current = null;
				} catch ( err ) {
					logDebug(
						'Delayed seed attempt failed',
						err,
						{ attempt: nextAttempt }
					);
					if ( nextAttempt < 5 ) {
						retrySeed( value, nextAttempt );
					}
				}
			}, delay );
		},
		[ editEntityRecord, optionName ]
	);

	useEffect( () => {
		if ( ! supportsEntityConfigSelector ) {
			logDebug(
				'Entity config selector unavailable; assuming ready state'
			);
			return;
		}

		if ( isEntityConfigReady ) {
			return;
		}

		logDebug( 'Resolving entity config for option', optionName );

		if ( addEntities && receiveEntityConfig && ! entityRegisteredRef.current ) {
			receiveEntityConfig(
				'root',
				'option',
				optionName,
				{
					name: optionName,
					kind: 'root',
					label: optionName,
					rest_base: optionName,
				}
			);
			addEntities( [
				{
					name: optionName,
					kind: 'root',
					baseURL: '/wp/v2/settings',
					key: optionName,
					plural: optionName,
					label: optionName,
				},
			] );
			entityRegisteredRef.current = true;
		}

		if ( receiveEntities ) {
			receiveEntities(
				'root',
				'option',
				[
					{
						id: optionName,
						name: optionName,
						value: bootstrap.settings ?? {},
					},
				],
				{
					name: optionName,
				}
			);
		}

		resolveEntityConfig( { invalidate: true } );

		if ( ! settingsFetchRef.current ) {
			settingsFetchRef.current = true;
			logDebug( 'Priming WP settings endpoint' );
			apiFetch( {
				path: '/wp/v2/settings',
				method: 'GET',
			} ).catch( ( error ) => {
				logDebug( 'Failed to prime settings endpoint', error );
			} );
		}

		const retry = window.setTimeout( () => {
			if ( ! isEntityConfigReady ) {
				logDebug(
					'Retrying entity config resolution for option',
					optionName
				);
				resolveEntityConfig( { invalidate: true } );
			}
		}, 1000 );

		return () => window.clearTimeout( retry );
	}, [
		isEntityConfigReady,
		optionName,
		addEntities,
		resolveEntityConfig,
		receiveEntities,
		supportsEntityConfigSelector,
	] );

	useEffect( () => {
		if ( isEntityConfigReady ) {
			// Apply pending seed if any
			if ( pendingSeedRef.current ) {
				const value = pendingSeedRef.current;
				pendingSeedRef.current = null;
				try {
					editEntityRecord( 'root', 'option', optionName, {
						value,
					} );
					if ( saveEditedEntityRecord ) {
						saveEditedEntityRecord( 'root', 'option', optionName ).catch( () => {} );
					}
					logDebug( 'Pending seed applied after entity ready' );
				} catch ( err ) {
					logDebug(
						'Pending seed failed after entity ready; retrying',
						err
					);
					retrySeed( value );
				}
			}

			// Apply any queued updates
			if ( pendingUpdatesQueueRef.current.length > 0 ) {
				const updates = [ ...pendingUpdatesQueueRef.current ];
				pendingUpdatesQueueRef.current = [];
				updates.forEach( ( value ) => {
					try {
						editEntityRecord( 'root', 'option', optionName, {
							value,
						} );
						if ( saveEditedEntityRecord ) {
							saveEditedEntityRecord( 'root', 'option', optionName ).catch( () => {} );
						}
						logDebug( 'Queued update applied after entity ready' );
					} catch ( err ) {
						logDebug( 'Queued update failed, re-queuing', err );
						pendingUpdatesQueueRef.current.push( value );
					}
				} );
			}
		}
	}, [
		isEntityConfigReady,
		editEntityRecord,
		saveEditedEntityRecord,
		optionName,
		retrySeed,
	] );

	useEffect( () => {
		if (
			! supportsEntityConfigSelector &&
			! hasFetchedOption &&
			Object.keys( blockDefinitions ).length > 0 &&
			! hasSeededFallbackRef.current
		) {
			const fallbackValue = sanitizeSettingsWithDefinitions(
				bootstrap.settings ??
					buildDefaultSettings( blockDefinitions ),
				blockDefinitions
			);
			logDebug(
				'Seeding fallback option (no entity selector available)',
				fallbackValue
			);
			hasSeededFallbackRef.current = true;
			if ( receiveEntityRecords ) {
				receiveEntityRecords(
					'root',
					'option',
					[
						{
							id: optionName,
							name: optionName,
							value: fallbackValue,
						},
					],
					{ name: optionName }
				);
			}
		}
	}, [
		supportsEntityConfigSelector,
		hasFetchedOption,
		blockDefinitions,
		bootstrap.settings,
		optionName,
		receiveEntityRecords,
	] );

	useEffect( () => {
		logDebug( 'Option status', {
			optionValue,
			persistedOptionValue,
			hasFetchedOption,
		} );
	}, [ optionValue, persistedOptionValue, hasFetchedOption ] );

	useEffect( () => {
		if ( ! isEntityConfigReady ) {
			logDebug( 'Entity config not ready; proceeding with fallback seeding' );
		}

		if (
			! hasFetchedOption &&
			! hasSeededFallbackRef.current &&
			Object.keys( blockDefinitions ).length > 0
		) {
			const fallbackValue = sanitizeSettingsWithDefinitions(
				bootstrap.settings ??
					buildDefaultSettings( blockDefinitions ),
				blockDefinitions
			);

			logDebug( 'Seeding fallback option value', fallbackValue );
			hasSeededFallbackRef.current = true;
			if ( isEntityConfigReady ) {
				editEntityRecord( 'root', 'option', optionName, {
					value: fallbackValue,
				} );
			} else if ( receiveEntityRecords ) {
				logDebug(
					'Entity config missing; seeding via receiveEntityRecords'
				);
				pendingSeedRef.current = fallbackValue;
				receiveEntityRecords(
					'root',
					'option',
					[
						{
							id: optionName,
							name: optionName,
							value: fallbackValue,
						},
					],
					{ name: optionName }
				);
				retrySeed( fallbackValue );
			}
			return;
		}

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
			isEntityConfigReady &&
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
		receiveEntityRecords,
		blockDefinitions,
		isEntityConfigReady,
		retrySeed,
	] );

	useEffect( () => {
		broadcastSettingsUpdate( normalizedOptionValue );
	}, [ normalizedOptionValue ] );

	const isOptionReady = hasFetchedOption;
	const baseBlocksEnabled = normalizedOptionValue.blocks_enabled || {};
	const blocksEnabled = localBlocksEnabled || baseBlocksEnabled;
	const dateNowApiKey = normalizedOptionValue.date_now_api_key || '';
	
	// Allow toggling even if option isn't fully ready - we'll use fallback values.
	const canToggle = true;

	// Sync local state when normalizedOptionValue changes.
	useEffect( () => {
		if ( normalizedOptionValue?.blocks_enabled ) {
			setLocalBlocksEnabled( normalizedOptionValue.blocks_enabled );
		}
	}, [ normalizedOptionValue ] );

	const applySettingsChange = useCallback(
		( updater ) => {
			// Use current normalized value or fallback to defaults
			// Merge with pending updates to ensure we have the latest state
			const baseValue = normalizedOptionValue || buildDefaultSettings( blockDefinitions );
			const currentValue = {
				...baseValue,
				blocks_enabled: {
					...( baseValue.blocks_enabled || {} ),
					...pendingUpdatesRef.current,
				},
			};
			
			const nextValue = sanitizeSettingsWithDefinitions(
				updater( currentValue ),
				blockDefinitions
			);

			// Update local entity store for immediate UI feedback
			try {
				editEntityRecord( 'root', 'option', optionName, {
					value: nextValue,
				} );
			} catch ( error ) {
				logDebug( 'applySettingsChange: error editing entity record', error );
			}

			// Track save request ID to ignore stale responses
			const saveRequestId = Date.now();
			activeSaveRequestRef.current = saveRequestId;

			// Save via REST API to persist changes
			// Extract path from full URL if needed
			let settingsPath = bootstrap?.restEndpoint || 'yokoi/v1/settings';
			if ( settingsPath.startsWith( 'http' ) ) {
				// Extract path from full URL
				const url = new URL( settingsPath );
				settingsPath = url.pathname.replace( '/wp-json/', '' );
			} else if ( settingsPath.startsWith( '/' ) ) {
				// Remove leading slash for apiFetch
				settingsPath = settingsPath.substring( 1 );
			}
			
			apiFetch( {
				path: settingsPath,
				method: 'POST',
				data: {
					blocks_enabled: nextValue.blocks_enabled,
					default_configs: nextValue.default_configs,
					visibility_controls: nextValue.visibility_controls,
					date_now_api_key: nextValue.date_now_api_key,
					nonce: bootstrap?.settingsNonce || bootstrap?.nonce || '',
				},
			} ).then( () => {
				// Only process if this is still the active request
				if ( activeSaveRequestRef.current === saveRequestId ) {
					logDebug( 'Settings saved successfully' );
					activeSaveRequestRef.current = null;
				}
			} ).catch( ( error ) => {
				// Only process if this is still the active request
				if ( activeSaveRequestRef.current !== saveRequestId ) {
					return;
				}
				activeSaveRequestRef.current = null;
				
				logDebug( 'applySettingsChange: error saving via REST API', error );
				// Revert local change on error
				if ( normalizedOptionValue ) {
					try {
						editEntityRecord( 'root', 'option', optionName, {
							value: normalizedOptionValue,
						} );
					} catch ( err ) {
						// Ignore revert errors
					}
				}
			} );
		},
		[
			editEntityRecord,
			optionName,
			normalizedOptionValue,
			blockDefinitions,
			bootstrap,
		]
	);

	const fetchBlockCatalog = useCallback(
		async ( { search = '', page = 1, append = false } = {} ) => {
			if ( ! blocksEndpoint ) {
				return;
			}

			// Request deduplication: check if same request is already in flight.
			const requestKey = `${ search }_${ page }`;
			if ( activeRequestsRef.current.has( requestKey ) ) {
				return activeRequestsRef.current.get( requestKey );
			}

			setBlockCatalogError( null );

			const requestPromise = ( async () => {
				try {
					const requestUrl = addQueryArgs( blocksEndpoint, {
						per_page: CATALOG_PAGE_SIZE,
						page,
						...( search ? { search } : {} ),
					} );

					// Use abort signal if available.
					const fetchOptions = {
						url: requestUrl,
						method: 'GET',
						parse: false,
					};

					// Add signal if abort controller exists.
					if ( abortControllerRef.current ) {
						fetchOptions.signal = abortControllerRef.current.signal;
					}

					const response = await apiFetch( fetchOptions );

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

					// Save to search history.
					if ( search && ! searchHistory.includes( search ) ) {
						setSearchHistory( ( prev ) => [ search, ...prev.slice( 0, 9 ) ] );
					}

					return { success: true };
				} catch ( err ) {
					// Don't set error if request was aborted.
					if ( err?.name !== 'AbortError' ) {
						setBlockCatalogError( err );
						if ( ! append ) {
							setCatalogMeta( {
								page: 0,
								totalPages: 0,
								search,
							} );
						}
					}
					throw err;
				} finally {
					// Remove from active requests.
					activeRequestsRef.current.delete( requestKey );
				}
			} )();

			// Store promise for deduplication.
			activeRequestsRef.current.set( requestKey, requestPromise );
			return requestPromise;
		},
		[ blocksEndpoint, searchHistory ]
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

	// Validate settings changes.
	const validateSettings = useCallback( ( settings ) => {
		const errors = {};
		
		// Validate blocks_enabled structure.
		if ( settings.blocks_enabled && typeof settings.blocks_enabled !== 'object' ) {
			errors.blocks_enabled = __( 'Blocks enabled must be an object.', 'yokoi' );
		}

		// Validate date_now_api_key format if provided.
		if ( settings.date_now_api_key && typeof settings.date_now_api_key !== 'string' ) {
			errors.date_now_api_key = __( 'API key must be a string.', 'yokoi' );
		}

		setValidationErrors( errors );
		return Object.keys( errors ).length === 0;
	}, [] );

	const toggleBlock = useCallback(
		( blockName ) => {
			// Read current state, including any pending updates
			const currentEnabled = { ...( localBlocksEnabled || baseBlocksEnabled ), ...pendingUpdatesRef.current };
			const newState = ! currentEnabled[ blockName ];
			const currentState = normalizedOptionValue;

			// Update local state immediately for instant UI feedback.
			setLocalBlocksEnabled( ( prev ) => ( {
				...( prev || baseBlocksEnabled ),
				...pendingUpdatesRef.current,
				[ blockName ]: newState,
			} ) );

			// Save to history for undo/redo (only once per batch).
			if ( settingsHistory.length === 0 || settingsHistory[ settingsHistory.length - 1 ] !== currentState ) {
				setSettingsHistory( ( prev ) => {
					const newHistory = prev.slice( 0, historyIndex + 1 );
					newHistory.push( JSON.parse( JSON.stringify( currentState ) ) );
					return newHistory.slice( -50 );
				} );
				setHistoryIndex( ( prev ) => Math.min( prev + 1, 49 ) );
			}

			// Add to toggling set for visual feedback.
			setTogglingBlocks( ( prev ) => new Set( prev ).add( blockName ) );

			// Add to pending updates.
			pendingUpdatesRef.current[ blockName ] = newState;

			// Clear existing timeout.
			if ( saveTimeoutRef.current ) {
				clearTimeout( saveTimeoutRef.current );
			}

			// Batch updates: wait 300ms before saving.
			saveTimeoutRef.current = setTimeout( () => {
				// Capture all pending updates at the time of save
				const updatesToApply = { ...pendingUpdatesRef.current };
				const togglingBlocksToClear = Object.keys( updatesToApply );
				
				// Don't clear pendingUpdatesRef yet - let applySettingsChange use it
				// We'll clear it after the save succeeds
				
				applySettingsChange( ( current ) => {
					// current already includes pendingUpdatesRef.current from applySettingsChange
					// But we also want to ensure updatesToApply is included
					const allUpdates = { ...updatesToApply, ...pendingUpdatesRef.current };
					
					const updated = {
						...current,
						blocks_enabled: {
							...( current.blocks_enabled || {} ),
							...allUpdates,
						},
					};
					
					// Validate before applying.
					if ( ! validateSettings( updated ) ) {
						// Revert local state on validation error.
						setLocalBlocksEnabled( baseBlocksEnabled );
						return current;
					}
					
					// Clear pending updates for blocks we're saving
					Object.keys( updatesToApply ).forEach( ( key ) => {
						delete pendingUpdatesRef.current[ key ];
					} );
					setValidationErrors( {} );
					return updated;
				} );

				// Remove all toggling blocks after save completes.
				setTimeout( () => {
					setTogglingBlocks( ( prev ) => {
						const next = new Set( prev );
						togglingBlocksToClear.forEach( ( name ) => next.delete( name ) );
						return next;
					} );
				}, 200 );
			}, 300 );
		},
		[ applySettingsChange, baseBlocksEnabled, localBlocksEnabled, normalizedOptionValue, settingsHistory, historyIndex, validateSettings ]
	);

	const toggleFavorite = useCallback( ( blockName ) => {
		setFavoriteBlocks( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( blockName ) ) {
				next.delete( blockName );
			} else {
				next.add( blockName );
			}
			return next;
		} );
	}, [] );

	const toggleAllBlocks = useCallback(
		( enable ) => {
			const allBlockNames = Object.keys( blockDefinitions );
			
			// Update local state immediately for instant UI feedback
			setLocalBlocksEnabled( ( prev ) => {
				const updated = { ...( prev || baseBlocksEnabled ) };
				allBlockNames.forEach( ( name ) => {
					updated[ name ] = enable;
				} );
				return updated;
			} );
			
			allBlockNames.forEach( ( blockName ) => {
				setTogglingBlocks( ( prev ) => new Set( prev ).add( blockName ) );
				pendingUpdatesRef.current[ blockName ] = enable;
			} );

			if ( saveTimeoutRef.current ) {
				clearTimeout( saveTimeoutRef.current );
			}

			saveTimeoutRef.current = setTimeout( () => {
				// Capture all pending updates at the time of save
				const updatesToApply = { ...pendingUpdatesRef.current };
				const togglingBlocksToClear = Object.keys( updatesToApply );
				
				applySettingsChange( ( current ) => {
					const updated = {
						...current,
						blocks_enabled: {
							...( current.blocks_enabled || {} ),
							...updatesToApply,
						},
					};
					
					// Clear pending updates for blocks we're saving
					Object.keys( updatesToApply ).forEach( ( key ) => {
						delete pendingUpdatesRef.current[ key ];
					} );
					
					return updated;
				} );

				setTimeout( () => {
					setTogglingBlocks( ( prev ) => {
						const next = new Set( prev );
						togglingBlocksToClear.forEach( ( name ) => next.delete( name ) );
						return next;
					} );
				}, 300 );
			}, 500 );
		},
		[ applySettingsChange, blockDefinitions, baseBlocksEnabled ]
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

	const handleExportSettings = useCallback( () => {
		const settings = normalizedOptionValue || buildDefaultSettings( blockDefinitions );
		const exportData = {
			version: '1.0',
			exported: new Date().toISOString(),
			settings: {
				blocks_enabled: settings.blocks_enabled,
				default_configs: settings.default_configs,
				visibility_controls: settings.visibility_controls,
				// Note: API keys are not exported for security.
			},
		};
		const blob = new Blob( [ JSON.stringify( exportData, null, 2 ) ], { type: 'application/json' } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = `yokoi-settings-${ new Date().toISOString().split( 'T' )[0] }.json`;
		document.body.appendChild( a );
		a.click();
		document.body.removeChild( a );
		URL.revokeObjectURL( url );
	}, [ normalizedOptionValue, blockDefinitions ] );

	const handleImportSettings = useCallback( () => {
		const input = document.createElement( 'input' );
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = ( e ) => {
			const file = e.target.files[0];
			if ( ! file ) {
				return;
			}
			const reader = new FileReader();
			reader.onload = ( event ) => {
				try {
					const importData = JSON.parse( event.target.result );
					if ( importData.settings && importData.version === '1.0' ) {
						applySettingsChange( ( current ) => ( {
							...current,
							blocks_enabled: {
								...current.blocks_enabled,
								...( importData.settings.blocks_enabled || {} ),
							},
							default_configs: {
								...current.default_configs,
								...( importData.settings.default_configs || {} ),
							},
							visibility_controls: {
								...current.visibility_controls,
								...( importData.settings.visibility_controls || {} ),
							},
						} ) );
					}
				} catch ( err ) {
					// Handle error.
					console.error( 'Failed to import settings:', err );
				}
			};
			reader.readAsText( file );
		};
		input.click();
	}, [ applySettingsChange ] );

	const applyPreset = useCallback( ( preset ) => {
		if ( preset === 'all' ) {
			toggleAllBlocks( true );
		} else if ( preset === 'none' ) {
			toggleAllBlocks( false );
		} else if ( preset === 'favorites' ) {
			const favoriteNames = Array.from( favoriteBlocks );
			favoriteNames.forEach( ( blockName ) => {
				if ( ! blocksEnabled[ blockName ] ) {
					toggleBlock( blockName );
				}
			} );
		}
	}, [ toggleAllBlocks, toggleBlock, favoriteBlocks, blocksEnabled ] );


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

	const hasUnsavedChanges = optionDirty;
	const isSavingChanges = optionSaving;
	const isBusy = isSavingChanges;

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
				<div className="yokoi-sidebar-content">
					<p>
						{ __(
							'You do not have permission to manage Yokoi settings.',
							'yokoi'
						) }
					</p>
				</div>
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
			>
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
									<Card>
										<CardBody>
											<Flex direction="column" gap={ 4 }>
												{ isDateNowEnabled && (
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

												<Flex direction="column" gap={ 2 }>
													<Button
														type="button"
														variant="secondary"
														onClick={ ( e ) => {
															e.preventDefault();
															e.stopPropagation();
															handleExportSettings();
														} }
														disabled={ isBusy }
													>
														{ __( 'Export Settings', 'yokoi' ) }
													</Button>
													<Button
														type="button"
														variant="secondary"
														onClick={ ( e ) => {
															e.preventDefault();
															e.stopPropagation();
															handleImportSettings();
														} }
														disabled={ isBusy }
													>
														{ __( 'Import Settings', 'yokoi' ) }
													</Button>
												</Flex>
											</Flex>
										</CardBody>
									</Card>
								);
							}

							return (
								<BlockTogglePanel
									error={ blockCatalogError }
									searchValue={ searchTerm }
									onSearchChange={ setSearchTerm }
									searchHistory={ searchHistory }
									hasMore={ hasMoreBlocks }
									onLoadMore={ loadMoreBlocks }
									blocksEnabled={ blocksEnabled }
									blockDefinitions={ blockDefinitions }
									onToggle={ toggleBlock }
									onToggleAll={ toggleAllBlocks }
									onToggleFavorite={ toggleFavorite }
									favoriteBlocks={ favoriteBlocks }
									togglingBlocks={ togglingBlocks }
									blockStatistics={ blockStatistics }
									validationErrors={ validationErrors }
									disabled={ ! canToggle || isBusy }
									onRetry={ () => {
										setBlockCatalogError( null );
										fetchBlockCatalog( {
											search: catalogMeta.search,
											page: catalogMeta.page || 1,
											append: false,
										} );
									} }
								/>
							);
						} }
					</TabPanel>
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

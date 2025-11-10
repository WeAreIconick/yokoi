import './style.scss';

import { registerPlugin } from '@wordpress/plugins';
import { Button, Notice, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import BlockTogglePanel from './components/BlockTogglePanel';

const bootstrap = window.yokoiSettings || {};
const initialBlockList = Array.isArray( bootstrap.blocks ) ? bootstrap.blocks : [];

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

	return output;
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

const getErrorMessage = ( error ) => {
	if ( ! error ) {
		return '';
	}

	if ( typeof error === 'string' ) {
		return error;
	}

	if ( error?.message ) {
		return error.message;
	}

	return __( 'An unexpected error occurred.', 'yokoi' );
};

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

	const sanitizeSettings = useCallback(
		( value, definitions = blockDefinitions ) =>
			sanitizeSettingsWithDefinitions( value, definitions ),
		[ blockDefinitions ]
	);

	const [ settings, setSettings ] = useState(
		sanitizeSettingsWithDefinitions(
			bootstrap.settings,
			blockDefinitions
		)
	);
	const [ isLoading, setIsLoading ] = useState( ! bootstrap.settings );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ hasChanges, setHasChanges ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ savedNotice, setSavedNotice ] = useState( false );

	const canManage = bootstrap?.capabilities?.canManage !== false;
	const restEndpoint = bootstrap?.restEndpoint;
	const blocksEndpoint = bootstrap?.blocksEndpoint;

	const ensureSettings = useCallback(
		( value, definitions = blockDefinitions ) =>
			sanitizeSettings( value, definitions ),
		[ sanitizeSettings, blockDefinitions ]
	);

	const fetchLatestSettings = useCallback( () => {
		if ( ! restEndpoint || ! canManage ) {
			setIsLoading( false );
			return;
		}

		setIsLoading( true );
		apiFetch( { url: restEndpoint, method: 'GET' } )
			.then( ( response ) => {
				setSettings( ensureSettings( response ) );
				setHasChanges( false );
				if ( savedNotice ) {
					setSavedNotice( false );
				}
				setError( null );
			} )
			.catch( ( err ) => {
				setError( err );
			} )
			.finally( () => {
				setIsLoading( false );
			} );
	}, [ restEndpoint, canManage, ensureSettings, savedNotice ] );

	useEffect( () => {
		if ( ! bootstrap.settings ) {
			fetchLatestSettings();
		}
	}, [ fetchLatestSettings ] );

	useEffect( () => {
		if ( ! blocksEndpoint ) {
			return;
		}

		let isMounted = true;

		setIsBlockCatalogLoading( true );
		setBlockCatalogError( null );

		apiFetch( { url: blocksEndpoint, method: 'GET' } )
			.then( ( response ) => {
				if ( ! isMounted ) {
					return;
				}

				const definitions = toDefinitionMap(
					Array.isArray( response ) ? response : []
				);
				setBlockDefinitions( definitions );
				setSettings( ( current ) =>
					sanitizeSettingsWithDefinitions( current, definitions )
				);
			} )
			.catch( ( err ) => {
				if ( ! isMounted ) {
					return;
				}

				setBlockCatalogError( err );
			} )
			.finally( () => {
				if ( isMounted ) {
					setIsBlockCatalogLoading( false );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [ blocksEndpoint ] );

	const blocksEnabled = useMemo(
		() => settings?.blocks_enabled || {},
		[ settings ]
	);

	const toggleBlock = useCallback( ( blockName ) => {
		setSettings( ( current ) => {
			const nextBlocks = {
				...current.blocks_enabled,
				[ blockName ]: ! current.blocks_enabled?.[ blockName ],
			};

			return {
				...current,
				blocks_enabled: nextBlocks,
			};
		} );
		setHasChanges( true );
	}, [] );

	const saveSettings = useCallback( () => {
		if ( ! restEndpoint ) {
			return;
		}

		setIsSaving( true );
		setError( null );

		apiFetch( {
			url: restEndpoint,
			method: 'POST',
			data: {
				blocks_enabled: settings.blocks_enabled,
				default_configs: settings.default_configs,
				visibility_controls: settings.visibility_controls,
			},
		} )
			.then( ( response ) => {
				const nextSettings = ensureSettings(
					response?.data || response
				);
				setSettings( nextSettings );
				setHasChanges( false );
				setSavedNotice( true );
				setTimeout( () => setSavedNotice( false ), 3000 );
			} )
			.catch( ( err ) => {
				setError( err );
			} )
			.finally( () => {
				setIsSaving( false );
			} );
	}, [ restEndpoint, settings, ensureSettings ] );

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
				{ isLoading && (
					<div className="yokoi-sidebar__loading">
						<Spinner />
						<p>{ __( 'Loading settings…', 'yokoi' ) }</p>
					</div>
				) }

				{ savedNotice && (
					<Notice status="success" isDismissible={ false }>
						{ __( 'Settings saved successfully.', 'yokoi' ) }
					</Notice>
				) }

				{ error && (
					<Notice status="error" onRemove={ () => setError( null ) }>
						{ getErrorMessage( error ) }
					</Notice>
				) }

				<BlockTogglePanel
			isLoading={ isBlockCatalogLoading }
			error={ blockCatalogError }
			searchValue={ searchTerm }
			onSearchChange={ setSearchTerm }
					blocksEnabled={ blocksEnabled }
					blockDefinitions={ blockDefinitions }
					onToggle={ toggleBlock }
				/>

				<div className="yokoi-sidebar__footer">
					<Button
						variant="secondary"
						onClick={ fetchLatestSettings }
						isBusy={ isLoading }
						disabled={ isSaving }
					>
						{ __( 'Reset', 'yokoi' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ saveSettings }
						isBusy={ isSaving }
						disabled={ ! hasChanges || isSaving }
					>
						{ isSaving
							? __( 'Saving…', 'yokoi' )
							: __( 'Save Settings', 'yokoi' ) }
					</Button>
				</div>
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
} );

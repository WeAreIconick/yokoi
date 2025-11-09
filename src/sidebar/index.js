import './style.scss';

import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
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

import BlockTogglePanel from './components/BlockTogglePanel';

const bootstrap = window.yokoiSettings || {};
const blockList = Array.isArray( bootstrap.blocks ) ? bootstrap.blocks : [];
const blockDefinitions = blockList.reduce( ( acc, block ) => {
	if ( block?.name ) {
		acc[ block.name ] = block;
	}
	return acc;
}, {} );
const defaultBlockStates = Object.fromEntries(
	Object.keys( blockDefinitions ).map( ( name ) => [ name, true ] )
);
const DEFAULT_SETTINGS = {
	blocks_enabled: defaultBlockStates,
	default_configs: {},
	visibility_controls: {},
};

const sanitizeSettingsShape = ( value ) => {
	const output = {
		...DEFAULT_SETTINGS,
		...( value || {} ),
	};

	output.blocks_enabled = {
		...DEFAULT_SETTINGS.blocks_enabled,
		...( value?.blocks_enabled || {} ),
	};

	// Ensure all known blocks have explicit values.
	Object.keys( blockDefinitions ).forEach( ( blockName ) => {
		if ( typeof output.blocks_enabled[ blockName ] !== 'boolean' ) {
			output.blocks_enabled[ blockName ] = Boolean(
				DEFAULT_SETTINGS.blocks_enabled[ blockName ]
			);
		}
	} );

	output.default_configs = {
		...DEFAULT_SETTINGS.default_configs,
		...( value?.default_configs || {} ),
	};

	output.visibility_controls = {
		...DEFAULT_SETTINGS.visibility_controls,
		...( value?.visibility_controls || {} ),
	};

	return output;
};

if ( bootstrap?.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( bootstrap.nonce ) );
}

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
	const [ settings, setSettings ] = useState(
		sanitizeSettingsShape( bootstrap.settings )
	);
	const [ isLoading, setIsLoading ] = useState( ! bootstrap.settings );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ hasChanges, setHasChanges ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ savedNotice, setSavedNotice ] = useState( false );

	const canManage = bootstrap?.capabilities?.canManage !== false;
	const restEndpoint = bootstrap?.restEndpoint;

	const ensureSettings = useCallback(
		( value ) => sanitizeSettingsShape( value ),
		[]
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
			</PluginSidebar>
		</Fragment>
	);
};

registerPlugin( 'yokoi-settings-sidebar', {
	render: YokoiSidebar,
	icon: 'admin-settings',
} );

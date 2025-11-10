<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package Yokoi
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$yokoi_options_to_delete = array(
	'yokoi_settings',
	'yokoi_block_metadata_cache',
	'yokoi_date_now_api_key',
	'yokoi_date_now_cache_keys',
);

foreach ( $yokoi_options_to_delete as $yokoi_option_name ) {
	delete_option( $yokoi_option_name );
	delete_site_option( $yokoi_option_name );
}

$yokoi_cache_keys = get_option( 'yokoi_date_now_cache_keys', array() );

if ( is_array( $yokoi_cache_keys ) ) {
	foreach ( $yokoi_cache_keys as $yokoi_cache_key ) {
		delete_transient( 'yokoi_date_now_' . $yokoi_cache_key );
	}
}

delete_option( 'yokoi_date_now_cache_keys' );


<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package Yokoi
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$options_to_delete = array(
	'yokoi_settings',
	'yokoi_block_metadata_cache',
	'yokoi_date_now_api_key',
);

foreach ( $options_to_delete as $option_name ) {
	delete_option( $option_name );
	delete_site_option( $option_name );
}

global $wpdb;

if ( isset( $wpdb ) ) {
	$transient_prefix = $wpdb->esc_like( 'yokoi_date_now_' ) . '%';

	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			'_transient_' . $transient_prefix,
			'_transient_timeout_' . $transient_prefix
		)
	);

	if ( is_multisite() ) {
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->sitemeta} WHERE meta_key LIKE %s OR meta_key LIKE %s",
				'_site_transient_' . $transient_prefix,
				'_site_transient_timeout_' . $transient_prefix
			)
		);
	}
}


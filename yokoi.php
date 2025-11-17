<?php
/**
 * Plugin Name: Yokoi
 * Plugin URI: https://iconick.io/yokoi
 * Description: Yokoi is packed with all the WordPress blocks I desperately wanted but couldn't find anywhere else. Responsive browser embeds? Check. Slick accordions? Got 'em. This is my personal collection of 'why doesn't this exist yet?' turned into 'oh hell yeah, now it does.'
 * Version: 0.1.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: Iconick
 * Author URI: https://iconick.io
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: yokoi
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'YOKOI_VERSION' ) ) {
	define( 'YOKOI_VERSION', '0.1.0' );
}

if ( ! defined( 'YOKOI_PLUGIN_FILE' ) ) {
	define( 'YOKOI_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'YOKOI_PLUGIN_DIR' ) ) {
	define( 'YOKOI_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'YOKOI_PLUGIN_URL' ) ) {
	define( 'YOKOI_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

if ( file_exists( YOKOI_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once YOKOI_PLUGIN_DIR . 'vendor/autoload.php';
}

require_once YOKOI_PLUGIN_DIR . 'includes/bootstrap.php';
require_once YOKOI_PLUGIN_DIR . 'includes/class-plugin.php';

/**
 * Initialize the Yokoi plugin.
 *
 * @return void
 */
function yokoi_init(): void {
	$plugin = new Yokoi\Plugin();
	$plugin->run();
}
add_action( 'plugins_loaded', 'yokoi_init' );

register_activation_hook( __FILE__, 'yokoi_activate' );
/**
 * Handle plugin activation.
 *
 * @return void
 */
function yokoi_activate(): void {
	if ( ! class_exists( 'Yokoi\\Settings_API' ) ) {
		require_once YOKOI_PLUGIN_DIR . 'includes/class-settings-api.php';
	}
	if ( ! function_exists( 'Yokoi\\get_block_catalog_entries' ) ) {
		require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';
	}

	Yokoi\Settings_API::seed_defaults();

	// Warm cache on activation.
	$catalog = Yokoi\get_block_catalog_entries();
	if ( ! empty( $catalog ) ) {
		// Cache is automatically set by get_block_catalog_entries().
	}

	add_option( 'yokoi_redirect_to_site_editor', 'yes', '', 'no' );
}

register_deactivation_hook( __FILE__, 'yokoi_deactivate' );
/**
 * Handle plugin deactivation.
 *
 * @return void
 */
function yokoi_deactivate(): void {
	// Future: cleanup tasks or cache flushes.
}

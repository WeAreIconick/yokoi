<?php
/**
 * Plugin Name: Yokoi
 * Plugin URI: https://iconick.io/yokoi
 * Description: Modular block suite with PluginSidebar settings for WordPress.
 * Version: 0.1.0
 * Author: Yokoi Team
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

	Yokoi\Settings_API::seed_defaults();
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

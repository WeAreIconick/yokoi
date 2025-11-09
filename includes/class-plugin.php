<?php
/**
 * Main plugin controller.
 *
 * @package Yokoi
 */

namespace Yokoi;

use WP_Block_Editor_Context;
use function __;
use function add_action;
use function add_filter;
use function current_user_can;
use function file_exists;
use function rest_url;
use function wp_add_inline_script;
use function wp_create_nonce;
use function wp_enqueue_script;
use function wp_enqueue_style;
use function wp_json_encode;
use function wp_list_filter;
use function wp_register_script;
use function wp_script_is;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coordinates initialization for the Yokoi plugin.
 */
class Plugin {
	/**
	 * Settings controller instance.
	 *
	 * @var Settings_API|null
	 */
	private ?Settings_API $settings_api = null;

	/**
	 * Block registry instance.
	 *
	 * @var Block_Registry|null
	 */
	private ?Block_Registry $block_registry = null;

	/**
	 * Block catalog REST controller.
	 *
	 * @var Block_Catalog_API|null
	 */
	private ?Block_Catalog_API $block_catalog_api = null;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->load_dependencies();
		$this->define_hooks();
	}

	/**
	 * Load PHP dependencies.
	 *
	 * @return void
	 */
	private function load_dependencies(): void {
		require_once YOKOI_PLUGIN_DIR . 'includes/class-settings-api.php';
		require_once YOKOI_PLUGIN_DIR . 'includes/class-block-registry.php';
		require_once YOKOI_PLUGIN_DIR . 'includes/class-block-catalog-api.php';

		$this->settings_api       = new Settings_API();
		$this->block_registry     = new Block_Registry( $this->settings_api );
		$this->block_catalog_api  = new Block_Catalog_API();
	}

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	private function define_hooks(): void {
		add_action( 'init', array( $this, 'init' ) );

		if ( $this->settings_api instanceof Settings_API ) {
			$this->settings_api->register();
		}

		if ( $this->block_registry instanceof Block_Registry ) {
			$this->block_registry->register();
		}

		if ( $this->block_catalog_api instanceof Block_Catalog_API ) {
			$this->block_catalog_api->register();
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ), 5 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'localize_editor_settings' ), 10 );
		add_filter( 'block_categories_all', array( $this, 'register_block_category' ), 10, 2 );
		add_filter( 'block_categories', array( $this, 'register_block_category_legacy' ), 10, 2 );
	}

	/**
	 * General init hook handler.
	 *
	 * @return void
	 */
	public function init(): void {
		// Reserved for future initialization tasks.
	}

	/**
	 * Executes after construction to start plugin runtime.
	 *
	 * @return void
	 */
	public function run(): void {
		// Future runtime tasks may be added here.
	}

	/**
	 * Enqueue sidebar scripts and styles for the block editor.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$asset_path = YOKOI_PLUGIN_DIR . 'build/sidebar.asset.php';

		if ( ! file_exists( $asset_path ) ) {
			return;
		}

		$asset        = include $asset_path;
		$dependencies = $asset['dependencies'] ?? array();
		$script_file  = YOKOI_PLUGIN_DIR . 'build/sidebar.js';
		$style_file   = YOKOI_PLUGIN_DIR . 'build/style-sidebar.css';
		$version      = $asset['version'] ?? YOKOI_VERSION;

		if ( file_exists( $script_file ) ) {
			$version .= '.' . filemtime( $script_file );
		}

		wp_register_script(
			'yokoi-sidebar',
			YOKOI_PLUGIN_URL . 'build/sidebar.js',
			$dependencies,
			$version,
			true
		);

		wp_enqueue_script( 'yokoi-sidebar' );

		$style_path = $style_file;

		if ( file_exists( $style_path ) ) {
			$style_version = $version;

			if ( file_exists( $style_path ) ) {
				$style_version .= '.' . filemtime( $style_path );
			}

			wp_enqueue_style(
				'yokoi-sidebar',
				YOKOI_PLUGIN_URL . 'build/style-sidebar.css',
				array(),
				$style_version
			);
		}
	}

	/**
	 * Add localized data for the upcoming editor UI.
	 *
	 * @return void
	 */
	public function localize_editor_settings(): void {
		if ( ! $this->settings_api instanceof Settings_API ) {
			return;
		}

		if ( ! wp_script_is( 'yokoi-sidebar', 'registered' ) ) {
			return;
		}

		$data = $this->get_editor_settings_payload();

		wp_add_inline_script(
			'yokoi-sidebar',
			'window.yokoiSettings = ' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP ) . ';',
			'before'
		);
	}

	/**
	 * Prepare the payload shared with the editor application.
	 *
	 * @return array<string,mixed>
	 */
	public function get_editor_settings_payload(): array {
		$settings = array();

		if ( $this->settings_api instanceof Settings_API ) {
			$settings = $this->settings_api->get_stored_settings();
		}

		$blocks = array();

		return array(
			'settings'     => $settings,
			'blocks'       => array(),
			'restEndpoint' => rest_url( Settings_API::REST_NAMESPACE . '/settings' ),
			'blocksEndpoint' => rest_url( Settings_API::REST_NAMESPACE . '/blocks' ),
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'capabilities' => array(
				'canManage' => current_user_can( 'manage_options' ),
			),
		);
	}

	/**
	 * Ensure the Yokoi block category exists for editor organization.
	 *
	 * @param array<int,array<string,string>> $categories Existing categories.
	 * @param WP_Block_Editor_Context         $context    Editor context.
	 *
	 * @return array<int,array<string,string>>
	 */
	public function register_block_category( array $categories, WP_Block_Editor_Context $context ): array {
		unset( $context );

		return $this->merge_block_category( $categories );
	}

	/**
	 * Back-compat category registration for WordPress < 5.8.
	 *
	 * @param array<int,array<string,string>> $categories Existing categories.
	 * @param mixed                           $post       Post object (unused).
	 *
	 * @return array<int,array<string,string>>
	 */
	public function register_block_category_legacy( array $categories, $post ): array {
		unset( $post );

		return $this->merge_block_category( $categories );
	}

	/**
	 * Merge the Yokoi category into the provided list.
	 *
	 * @param array<int,array<string,string>> $categories Existing categories.
	 *
	 * @return array<int,array<string,string>>
	 */
	private function merge_block_category( array $categories ): array {
		$exists = wp_list_filter( $categories, array( 'slug' => 'yokoi' ) );

		if ( empty( $exists ) ) {
			$categories[] = array(
				'slug'  => 'yokoi',
				'title' => __( 'Yokoi', 'yokoi' ),
			);
		}

		return $categories;
	}
}

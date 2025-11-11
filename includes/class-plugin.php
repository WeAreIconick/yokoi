<?php
/**
 * Main plugin controller.
 *
 * @package Yokoi
 */

namespace Yokoi;

use WP_Block_Editor_Context;
use WP_Block_Type_Registry;
use Yokoi\Date_Now\Service as Date_Now_Service;
use function __;
use function add_action;
use function add_filter;
use function add_query_arg;
use function admin_url;
use function array_unique;
use function current_user_can;
use function delete_option;
use function esc_html;
use function esc_url;
use function file_exists;
use function get_current_screen;
use function get_option;
use function is_admin;
use function plugin_basename;
use function rest_url;
use function wp_add_inline_script;
use function wp_create_nonce;
use function wp_enqueue_script;
use function wp_enqueue_style;
use function wp_json_encode;
use function wp_list_filter;
use function wp_register_script;
use function wp_safe_redirect;
use function wp_script_is;
use function wp_doing_ajax;

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
	 * Date.now integration.
	 *
	 * @var Date_Now_Service|null
	 */
	private ?Date_Now_Service $date_now_service = null;

	/**
	 * Cached block enabled state map.
	 *
	 * @var array<string,bool>|null
	 */
	private ?array $block_enabled_cache = null;

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

		$this->settings_api      = new Settings_API();
		$this->block_registry    = new Block_Registry( $this->settings_api );
		$this->block_catalog_api = new Block_Catalog_API();
		$this->date_now_service  = new Date_Now_Service();
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

		if ( $this->date_now_service instanceof Date_Now_Service ) {
			$this->date_now_service->register();
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ), 5 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'localize_editor_settings' ), 10 );
		add_filter( 'block_categories_all', array( $this, 'register_block_category' ), 10, 2 );
		add_filter( 'block_categories', array( $this, 'register_block_category_legacy' ), 10, 2 );
		add_filter( 'allowed_block_types_all', array( $this, 'filter_allowed_block_types' ), 10, 2 );
		add_filter( 'render_block', array( $this, 'maybe_disable_block_output' ), 10, 2 );
		add_action( 'admin_init', array( $this, 'maybe_redirect_to_site_editor' ) );
		add_filter(
			'plugin_action_links_' . plugin_basename( YOKOI_PLUGIN_FILE ),
			array( $this, 'add_plugin_action_link' )
		);
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
		if ( ! $this->is_site_editor_context() ) {
			return;
		}

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

		$editor_asset_path = YOKOI_PLUGIN_DIR . 'build/index.asset.php';
		$editor_script_path = YOKOI_PLUGIN_DIR . 'build/index.js';

		if ( file_exists( $editor_asset_path ) && file_exists( $editor_script_path ) ) {
			$editor_asset      = include $editor_asset_path;
			$editor_deps       = $editor_asset['dependencies'] ?? array();
			$editor_version    = $editor_asset['version'] ?? YOKOI_VERSION;
			$editor_version   .= '.' . filemtime( $editor_script_path );
			$editor_deps[]     = 'yokoi-sidebar';
			$editor_deps       = array_unique( $editor_deps );

			wp_register_script(
				'yokoi-editor-controls',
				YOKOI_PLUGIN_URL . 'build/index.js',
				$editor_deps,
				$editor_version,
				true
			);

			wp_enqueue_script( 'yokoi-editor-controls' );
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

		if ( ! $this->is_site_editor_context() ) {
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
			'settings'       => $settings,
			'blocks'         => array(),
			'restEndpoint'   => rest_url( Settings_API::REST_NAMESPACE . '/settings' ),
			'blocksEndpoint' => rest_url( Settings_API::REST_NAMESPACE . '/blocks' ),
			'nonce'          => wp_create_nonce( 'wp_rest' ),
			'settingsNonce'  => wp_create_nonce( 'yokoi_settings' ),
			'capabilities'   => array(
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

	/**
	 * Determine whether the current admin screen is the Site Editor.
	 *
	 * @return bool
	 */
	private function is_site_editor_context(): bool {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return false;
		}

		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		if ( isset( $screen->id ) && 'site-editor' === $screen->id ) {
			return true;
		}

		if ( isset( $screen->base ) && 'site-editor' === $screen->base ) {
			return true;
		}

		return false;
	}

	/**
	 * Filter block output to suppress disabled Yokoi blocks.
	 *
	 * @param string $content Rendered block markup.
	 * @param array  $block   Block metadata.
	 *
	 * @return string
	 */
	public function maybe_disable_block_output( string $content, array $block ): string {
		$block_name = $block['blockName'] ?? '';

		if ( ! is_string( $block_name ) || '' === $block_name ) {
			return $content;
		}

		if ( 0 !== strpos( $block_name, 'yokoi/' ) ) {
			return $content;
		}

		if ( $this->is_block_enabled( $block_name ) ) {
			return $content;
		}

		if ( is_admin() ) {
			return sprintf(
				'<div class="yokoi-block-disabled">'. // phpcs:ignore WordPress.Security.EscapeOutput
				'<p>%s</p>'.
				'</div>',
				esc_html(
					sprintf(
						/* translators: %s: block name */
						__( '%s is disabled in Yokoi settings.', 'yokoi' ),
						$block_name
					)
				)
			);
		}

		return '';
	}

	/**
	 * Determine whether a given block is enabled.
	 *
	 * @param string $block_name Block identifier.
	 *
	 * @return bool
	 */
	private function is_block_enabled( string $block_name ): bool {
		if ( null === $this->block_enabled_cache ) {
			$this->block_enabled_cache = array();

			if ( $this->settings_api instanceof Settings_API ) {
				$settings = $this->settings_api->get_stored_settings();
				$map      = $settings['blocks_enabled'] ?? array();

				if ( is_array( $map ) ) {
					$this->block_enabled_cache = $map;
				}
			}
		}

		if ( isset( $this->block_enabled_cache[ $block_name ] ) ) {
			return (bool) $this->block_enabled_cache[ $block_name ];
		}

		return true;
	}

	/**
	 * Retrieve disabled Yokoi block names.
	 *
	 * @return array<int,string>
	 */
	private function get_disabled_block_names(): array {
		if ( null === $this->block_enabled_cache ) {
			$this->is_block_enabled( '' );
		}

		if ( empty( $this->block_enabled_cache ) ) {
			return array();
		}

		$disabled = array();

		foreach ( $this->block_enabled_cache as $name => $enabled ) {
			if ( 0 === strpos( $name, 'yokoi/' ) && ! $enabled ) {
				$disabled[] = $name;
			}
		}

		return $disabled;
	}

	/**
	 * Remove disabled blocks from the inserter.
	 *
	 * @param bool|array $allowed_block_types Current allowed block types.
	 * @param mixed      $editor_context      Editor context.
	 *
	 * @return bool|array
	 */
	public function filter_allowed_block_types( $allowed_block_types, $editor_context = null ) {
		unset( $editor_context );

		$disabled = $this->get_disabled_block_names();

		if ( empty( $disabled ) ) {
			return $allowed_block_types;
		}

		if ( true === $allowed_block_types ) {
			$registry = WP_Block_Type_Registry::get_instance();
			$all      = array_keys( $registry->get_all_registered() );

			return array_values( array_diff( $all, $disabled ) );
		}

		if ( is_array( $allowed_block_types ) ) {
			return array_values( array_diff( $allowed_block_types, $disabled ) );
		}

		return $allowed_block_types;
	}

	/**
	 * Redirect administrators to the Site Editor after activation.
	 *
	 * @return void
	 */
	public function maybe_redirect_to_site_editor(): void {
		if ( 'yes' !== get_option( 'yokoi_redirect_to_site_editor' ) ) {
			return;
		}

		if ( wp_doing_ajax() || ! current_user_can( 'edit_theme_options' ) ) {
			delete_option( 'yokoi_redirect_to_site_editor' );
			return;
		}

		$redirect_url = add_query_arg(
			array(
				'path'          => rawurlencode( '/' ),
				'yokoi_sidebar' => '1',
			),
			admin_url( 'site-editor.php' )
		);

		delete_option( 'yokoi_redirect_to_site_editor' );

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Add a Settings link on the Plugins screen.
	 *
	 * @param array<int,string> $links Existing action links.
	 *
	 * @return array<int,string>
	 */
	public function add_plugin_action_link( array $links ): array {
		$settings_url = add_query_arg(
			array(
				'path'          => rawurlencode( '/' ),
				'yokoi_sidebar' => '1',
			),
			admin_url( 'site-editor.php' )
		);

		array_unshift(
			$links,
			sprintf(
				'<a href="%s">%s</a>',
				esc_url( $settings_url ),
				__( 'Settings', 'yokoi' )
			)
		);

		return $links;
	}
}

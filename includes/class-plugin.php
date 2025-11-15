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
use Yokoi\Navygator\Service as Navygator_Service;
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
	 * NavyGator integration.
	 *
	 * @var Navygator_Service|null
	 */
	private ?Navygator_Service $navygator_service = null;

	/**
	 * Block statistics tracker.
	 *
	 * @var Block_Statistics|null
	 */
	private ?Block_Statistics $block_statistics = null;

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
		// Load dependency checker first.
		require_once YOKOI_PLUGIN_DIR . 'includes/class-dependency-checker.php';

		// Load core dependencies with error handling.
		$dependencies = array(
			'class-settings-api.php'      => 'Settings_API',
			'class-block-registry.php'    => 'Block_Registry',
			'class-block-catalog-api.php'  => 'Block_Catalog_API',
			'class-block-statistics.php'  => 'Block_Statistics',
			'class-block-isolation.php'   => 'Block_Isolation',
			'class-block-monitor.php'     => 'Block_Monitor',
			'class-z-index-manager.php'   => 'Z_Index_Manager',
		);

		foreach ( $dependencies as $file => $class_name ) {
			$file_path = YOKOI_PLUGIN_DIR . 'includes/' . $file;
			if ( ! Dependency_Checker::require_file( $file_path, true ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Required file not found: {$file_path}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( "Yokoi: Failed to load required file: {$file}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				continue;
			}

			// Validate class exists before using.
			$full_class_name = __NAMESPACE__ . '\\' . $class_name;
			if ( ! Dependency_Checker::class_exists( $full_class_name ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Required class not found: {$class_name}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				continue;
			}
		}

		// Load block-specific services.
		$block_services = array(
			'Date_Now/Service.php'  => 'Date_Now\\Service',
			'Navygator/Service.php' => 'Navygator\\Service',
		);

		foreach ( $block_services as $file => $class_name ) {
			$file_path = YOKOI_PLUGIN_DIR . 'includes/' . $file;
			if ( Dependency_Checker::require_file( $file_path, true ) ) {
				$full_class_name = __NAMESPACE__ . '\\' . $class_name;
				if ( Dependency_Checker::class_exists( $full_class_name ) ) {
					// Service will be instantiated below if class exists.
				}
			}
		}

		// Initialize services with error handling.
		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Settings_API' ) ) {
				$this->settings_api = new Settings_API();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Settings_API: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->settings_api && Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Registry' ) ) {
				$this->block_registry = new Block_Registry( $this->settings_api );
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Registry: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Catalog_API' ) ) {
				$this->block_catalog_api = new Block_Catalog_API();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Catalog_API: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Date_Now\\Service' ) ) {
				$this->date_now_service = new Date_Now_Service();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Date_Now_Service: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Navygator\\Service' ) ) {
				$this->navygator_service = new Navygator_Service();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Navygator_Service: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Statistics' ) ) {
				$this->block_statistics = new Block_Statistics();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Statistics: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		// Initialize optional systems with error handling.
		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Isolation' ) ) {
				new Block_Isolation();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Isolation: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Monitor' ) ) {
				new Block_Monitor();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Monitor: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Z_Index_Manager' ) ) {
				new Z_Index_Manager();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Z_Index_Manager: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		// Always initialize fallback registry as a safety net
		// This must be wrapped in extra safety checks to prevent fatal errors
		try {
			$fallback_file = YOKOI_PLUGIN_DIR . 'includes/class-block-fallback-registry.php';
			if ( ! file_exists( $fallback_file ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( 'Yokoi: Fallback registry file not found: ' . $fallback_file ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			} else {
				require_once $fallback_file;
				
				if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Block_Fallback_Registry' ) ) {
					try {
						$fallback_registry = new Block_Fallback_Registry();
						$fallback_registry->register();
					} catch ( \Throwable $e ) {
						if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
							error_log( 'Yokoi: Failed to instantiate Block_Fallback_Registry: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						}
					}
				} else {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						error_log( 'Yokoi: Block_Fallback_Registry class not found after requiring file' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					}
				}
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to initialize Block_Fallback_Registry: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			// Don't let this stop plugin initialization
		}
	}

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	private function define_hooks(): void {
		if ( ! function_exists( 'add_action' ) ) {
			return;
		}

		add_action( 'init', array( $this, 'init' ) );

		try {
			if ( $this->settings_api instanceof Settings_API ) {
				$this->settings_api->register();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Settings_API: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->block_registry instanceof Block_Registry ) {
				$this->block_registry->register();
			} else {
				// Block_Registry failed to initialize - log warning
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( 'Yokoi: Block_Registry is not initialized - blocks may not register properly' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Block_Registry: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->block_catalog_api instanceof Block_Catalog_API ) {
				$this->block_catalog_api->register();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Block_Catalog_API: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->date_now_service instanceof Date_Now_Service ) {
				$this->date_now_service->register();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Date_Now_Service: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->navygator_service instanceof Navygator_Service ) {
				$this->navygator_service->register();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Navygator_Service: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		try {
			if ( $this->block_statistics instanceof Block_Statistics ) {
				$this->block_statistics->register();
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register Block_Statistics: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		// Register hooks with error handling.
		$action_hooks = array(
			array( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ), 5 ),
			array( 'enqueue_block_editor_assets', array( $this, 'localize_editor_settings' ), 10 ),
			array( 'admin_init', array( $this, 'maybe_redirect_to_site_editor' ) ),
			array( 'enqueue_block_assets', array( $this, 'prevent_cozy_mode_frontend_styles_in_editor' ), 999 ),
		);

		foreach ( $action_hooks as $hook ) {
			try {
				call_user_func_array( 'add_action', $hook );
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( 'Yokoi: Failed to register action hook: ' . ( $hook[0] ?? 'unknown' ) . ' - ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			}
		}

		$filter_hooks = array(
			// Use priority 5 to register category early, before other plugins (lower number = earlier)
			array( 'block_categories_all', array( $this, 'register_block_category' ), 5, 2 ),
			array( 'block_categories', array( $this, 'register_block_category_legacy' ), 5, 2 ),
			array( 'allowed_block_types_all', array( $this, 'filter_allowed_block_types' ), 10, 2 ),
			array( 'render_block', array( $this, 'maybe_disable_block_output' ), 10, 2 ),
		);

		// Clear block enabled cache when settings are updated
		add_action( 'yokoi_settings_updated', array( $this, 'clear_block_enabled_cache' ) );

		foreach ( $filter_hooks as $hook ) {
			try {
				call_user_func_array( 'add_filter', $hook );
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( 'Yokoi: Failed to register filter hook: ' . ( $hook[0] ?? 'unknown' ) . ' - ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			}
		}

		// Register plugin action link with error handling.
		try {
			if ( function_exists( 'plugin_basename' ) && defined( 'YOKOI_PLUGIN_FILE' ) ) {
				add_filter(
					'plugin_action_links_' . plugin_basename( YOKOI_PLUGIN_FILE ),
					array( $this, 'add_plugin_action_link' )
				);
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to register plugin action link: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}
	}

	/**
	 * Prevent Cozy Mode frontend styles from loading in the editor.
	 *
	 * @return void
	 */
	public function prevent_cozy_mode_frontend_styles_in_editor(): void {
		// Only run in admin/editor context - skip on frontend
		if ( ! is_admin() ) {
			return;
		}

		// Dequeue the frontend style if it was auto-loaded by WordPress
		wp_dequeue_style( 'yokoi-cozy-mode-style' );
		wp_deregister_style( 'yokoi-cozy-mode-style' );
		
		// Also try to remove any style handles that WordPress might have auto-generated
		// WordPress auto-generates handles like 'wp-block-yokoi-cozy-mode'
		$auto_handles = array(
			'wp-block-yokoi-cozy-mode',
			'yokoi-cozy-mode-style',
		);
		
		foreach ( $auto_handles as $handle ) {
			wp_dequeue_style( $handle );
			wp_deregister_style( $handle );
		}
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
			$style_version = $version . '.' . filemtime( $style_path );

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
			'window.yokoiSettings = ' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP ) . ';' .
			'window.yokoiBootstrap = ' . wp_json_encode( array( 'blockDefinitions' => $data['blockDefinitions'] ?? array() ), JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP ) . ';',
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
		$block_definitions = array();

		if ( $this->block_registry instanceof Block_Registry ) {
			$block_definitions = $this->block_registry->get_block_definitions();
		}

		return array(
			'settings'        => $settings,
			'blocks'          => array(),
			'blockDefinitions' => $block_definitions,
			'restEndpoint'    => rest_url( Settings_API::REST_NAMESPACE . '/settings' ),
			'blocksEndpoint'  => rest_url( Settings_API::REST_NAMESPACE . '/blocks' ),
			'nonce'           => wp_create_nonce( 'wp_rest' ),
			'settingsNonce'   => wp_create_nonce( 'yokoi_settings' ),
			'capabilities'    => array(
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
		// Find existing Yokoi category
		$yokoi_index = false;
		$yokoi_category = null;
		
		foreach ( $categories as $index => $category ) {
			if ( isset( $category['slug'] ) && 'yokoi' === $category['slug'] ) {
				$yokoi_index = $index;
				$yokoi_category = $category;
				break;
			}
		}

		if ( null === $yokoi_category ) {
			// Category doesn't exist, add it at the beginning
			array_unshift(
				$categories,
				array(
					'slug'  => 'yokoi',
					'title' => __( 'Yokoi', 'yokoi' ),
					'icon'  => null,
				)
			);
		} elseif ( false !== $yokoi_index && $yokoi_index > 0 ) {
			// Category exists but not at the top, move it to the beginning
			unset( $categories[ $yokoi_index ] );
			array_unshift( $categories, $yokoi_category );
			// Re-index array
			$categories = array_values( $categories );
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
			// Track block usage.
			if ( $this->block_statistics instanceof Block_Statistics ) {
				$post_id = get_the_ID();
				if ( $post_id ) {
					$this->block_statistics->track_post_blocks( $post_id, get_post( $post_id ) );
				}
			}
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
	 * Clear the block enabled cache.
	 * Call this when settings are updated to ensure fresh data.
	 *
	 * @return void
	 */
	public function clear_block_enabled_cache(): void {
		$this->block_enabled_cache = null;
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
			// Only filter out Yokoi blocks that are explicitly disabled
			// Blocks not in cache default to enabled (see is_block_enabled)
			if ( 0 === strpos( $name, 'yokoi/' ) && false === $enabled ) {
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

		// Safety check: if Settings_API failed to load, don't filter anything
		if ( ! $this->settings_api instanceof Settings_API ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Settings_API not available, skipping block filtering' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return $allowed_block_types;
		}

		$disabled = $this->get_disabled_block_names();

		if ( empty( $disabled ) ) {
			return $allowed_block_types;
		}

		if ( true === $allowed_block_types ) {
			$registry = WP_Block_Type_Registry::get_instance();
			$all      = array_keys( $registry->get_all_registered() );

			$filtered = array_values( array_diff( $all, $disabled ) );
			
			// Debug: Log if NavyGator is being filtered
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				$navygator_registered = $registry->is_registered( 'yokoi/navygator' );
				$navygator_disabled = in_array( 'yokoi/navygator', $disabled, true );
				$navygator_allowed = in_array( 'yokoi/navygator', $filtered, true );
				
				if ( $navygator_registered ) {
					error_log( sprintf( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						'Yokoi: NavyGator filter check - Registered: %s, Disabled: %s, Allowed: %s, Cache: %s',
						$navygator_registered ? 'yes' : 'no',
						$navygator_disabled ? 'yes' : 'no',
						$navygator_allowed ? 'yes' : 'no',
						isset( $this->block_enabled_cache['yokoi/navygator'] ) ? ( $this->block_enabled_cache['yokoi/navygator'] ? 'enabled' : 'disabled' ) : 'not in cache'
					) );
				} elseif ( ! $navygator_registered ) {
					// NavyGator is not registered - this is a problem
					error_log( 'Yokoi: NavyGator is NOT registered in block registry - check Block_Registry or Block_Fallback_Registry' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			}
			
			return $filtered;
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

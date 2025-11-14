<?php
/**
 * Block isolation manager - ensures blocks don't interfere with each other.
 *
 * @package Yokoi
 */

namespace Yokoi;

require_once YOKOI_PLUGIN_DIR . 'includes/class-dependency-checker.php';

use function add_action;
use function add_filter;
use function apply_filters;
use function esc_attr;
use function esc_html;
use function register_block_type;
use function wp_register_script;
use function wp_register_style;
use function WP_Block_Type_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages block isolation to prevent conflicts.
 */
class Block_Isolation {
	/**
	 * Registered block namespaces.
	 *
	 * @var array<string,array<string,mixed>>
	 */
	private array $registered_namespaces = array();

	/**
	 * Registered asset handles.
	 *
	 * @var array<string,bool>
	 */
	private array $registered_handles = array();

	/**
	 * CSS class prefixes in use.
	 *
	 * @var array<string,bool>
	 */
	private array $css_prefixes = array();

	/**
	 * JavaScript global variables in use.
	 *
	 * @var array<string,bool>
	 */
	private array $js_globals = array();

	/**
	 * Hook priorities in use.
	 *
	 * @var array<string,array<int,bool>>
	 */
	private array $hook_priorities = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->register();
	}

	/**
	 * Register isolation checks.
	 *
	 * @return void
	 */
	private function register(): void {
		add_action( 'init', array( $this, 'validate_block_registrations' ), 999 );
		add_filter( 'yokoi_block_asset_handle', array( $this, 'validate_asset_handle' ), 10, 3 );
		add_filter( 'yokoi_block_css_prefix', array( $this, 'validate_css_prefix' ), 10, 2 );
		add_filter( 'yokoi_block_js_namespace', array( $this, 'validate_js_namespace' ), 10, 2 );
		add_filter( 'yokoi_block_hook_priority', array( $this, 'validate_hook_priority' ), 10, 3 );
	}

	/**
	 * Validate all block registrations for conflicts.
	 *
	 * @return void
	 */
	public function validate_block_registrations(): void {
		// Validate dependencies before proceeding.
		if ( ! Dependency_Checker::validate_dependencies(
			array( 'includes/block-utils.php' ),
			array( 'get_block_definitions_map' )
		) ) {
			// Silently fail if dependencies aren't available.
			return;
		}

		$registry = \WP_Block_Type_Registry::get_instance();
		$blocks   = Dependency_Checker::safe_call( 'get_block_definitions_map', array() );
		
		if ( empty( $blocks ) ) {
			return;
		}

		$errors = array();

		foreach ( $blocks as $block_name => $definition ) {
			// Check if block is registered.
			if ( ! $registry->is_registered( $block_name ) ) {
				continue;
			}

			// Validate namespace format.
			if ( ! preg_match( '/^yokoi\/[a-z0-9-]+$/', $block_name ) ) {
				$errors[] = sprintf(
					/* translators: %s: Block name */
					esc_html__( 'Block name "%s" does not follow naming convention (yokoi/block-name).', 'yokoi' ),
					esc_html( $block_name )
				);
			}

			// Check for duplicate namespaces.
			$namespace = $this->extract_namespace( $block_name );
			if ( isset( $this->registered_namespaces[ $namespace ] ) ) {
				$errors[] = sprintf(
					/* translators: %s: Namespace */
					esc_html__( 'Duplicate namespace detected: "%s".', 'yokoi' ),
					esc_html( $namespace )
				);
			} else {
				$this->registered_namespaces[ $namespace ] = $block_name;
			}
		}

		// Log errors in debug mode.
		if ( ! empty( $errors ) && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'Yokoi Block Isolation Errors: ' . implode( ' | ', $errors ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
	}

	/**
	 * Validate and normalize asset handle.
	 *
	 * @param string $handle Proposed handle.
	 * @param string $block_name Block name.
	 * @param string $type Asset type (script|style).
	 * @return string
	 */
	public function validate_asset_handle( string $handle, string $block_name, string $type ): string {
		// Normalize handle format: yokoi-{block-slug}-{type}
		$block_slug = $this->extract_block_slug( $block_name );
		$normalized = sprintf( 'yokoi-%s-%s', $block_slug, $type );

		// Check for conflicts.
		if ( isset( $this->registered_handles[ $normalized ] ) ) {
			// Add block name to make unique.
			$normalized = sprintf( 'yokoi-%s-%s-%s', $block_slug, $type, wp_rand( 1000, 9999 ) );
		}

		$this->registered_handles[ $normalized ] = true;

		return $normalized;
	}

	/**
	 * Validate CSS class prefix.
	 *
	 * @param string $prefix Proposed prefix.
	 * @param string $block_name Block name.
	 * @return string
	 */
	public function validate_css_prefix( string $prefix, string $block_name ): string {
		// Normalize prefix format: {block-slug}-
		$block_slug = $this->extract_block_slug( $block_name );
		$normalized  = $block_slug . '-';

		// Check for conflicts.
		if ( isset( $this->css_prefixes[ $normalized ] ) ) {
			// Add block name to make unique.
			$normalized = $block_slug . '-' . wp_rand( 1000, 9999 ) . '-';
		}

		$this->css_prefixes[ $normalized ] = true;

		return $normalized;
	}

	/**
	 * Validate JavaScript namespace.
	 *
	 * @param string $namespace Proposed namespace.
	 * @param string $block_name Block name.
	 * @return string
	 */
	public function validate_js_namespace( string $namespace, string $block_name ): string {
		// Normalize namespace format: Yokoi{BlockName}
		$block_slug = $this->extract_block_slug( $block_name );
		$normalized  = 'Yokoi' . $this->slug_to_class_name( $block_slug );

		// Check for conflicts.
		if ( isset( $this->js_globals[ $normalized ] ) ) {
			// Add block name to make unique.
			$normalized = 'Yokoi' . $this->slug_to_class_name( $block_slug ) . wp_rand( 1000, 9999 );
		}

		$this->js_globals[ $normalized ] = true;

		return $normalized;
	}

	/**
	 * Validate hook priority.
	 *
	 * @param int    $priority Proposed priority.
	 * @param string $hook Hook name.
	 * @param string $block_name Block name.
	 * @return int
	 */
	public function validate_hook_priority( int $priority, string $hook, string $block_name ): int {
		// Ensure priority is within valid range.
		if ( $priority < 1 || $priority > 999 ) {
			$priority = 10;
		}

		// Check for conflicts with same hook and priority.
		$key = $hook . ':' . $priority;
		if ( isset( $this->hook_priorities[ $key ] ) ) {
			// Increment priority to avoid conflict.
			$priority = $priority + 1;
			$key     = $hook . ':' . $priority;
		}

		$this->hook_priorities[ $key ] = true;

		return $priority;
	}

	/**
	 * Extract namespace from block name.
	 *
	 * @param string $block_name Block name (e.g., "yokoi/navygator").
	 * @return string
	 */
	private function extract_namespace( string $block_name ): string {
		$parts = explode( '/', $block_name );
		return $parts[0] ?? '';
	}

	/**
	 * Extract block slug from block name.
	 *
	 * @param string $block_name Block name (e.g., "yokoi/navygator").
	 * @return string
	 */
	private function extract_block_slug( string $block_name ): string {
		$parts = explode( '/', $block_name );
		return $parts[1] ?? '';
	}

	/**
	 * Convert slug to class name.
	 *
	 * @param string $slug Block slug (e.g., "navygator").
	 * @return string
	 */
	private function slug_to_class_name( string $slug ): string {
		$parts = explode( '-', $slug );
		$parts = array_map( 'ucfirst', $parts );
		return implode( '', $parts );
	}

	/**
	 * Get recommended CSS prefix for a block.
	 *
	 * @param string $block_name Block name.
	 * @return string
	 */
	public function get_css_prefix( string $block_name ): string {
		if ( ! is_callable( 'apply_filters' ) ) {
			return '';
		}
		return apply_filters( 'yokoi_block_css_prefix', '', $block_name );
	}

	/**
	 * Get recommended JavaScript namespace for a block.
	 *
	 * @param string $block_name Block name.
	 * @return string
	 */
	public function get_js_namespace( string $block_name ): string {
		if ( ! is_callable( 'apply_filters' ) ) {
			return '';
		}
		return apply_filters( 'yokoi_block_js_namespace', '', $block_name );
	}

	/**
	 * Get recommended asset handle for a block.
	 *
	 * @param string $block_name Block name.
	 * @param string $type Asset type (script|style).
	 * @return string
	 */
	public function get_asset_handle( string $block_name, string $type ): string {
		if ( ! is_callable( 'apply_filters' ) ) {
			return '';
		}
		return apply_filters( 'yokoi_block_asset_handle', '', $block_name, $type );
	}

	/**
	 * Get recommended hook priority for a block.
	 *
	 * @param string $hook Hook name.
	 * @param string $block_name Block name.
	 * @return int
	 */
	public function get_hook_priority( string $hook, string $block_name ): int {
		if ( ! is_callable( 'apply_filters' ) ) {
			return 10;
		}
		return apply_filters( 'yokoi_block_hook_priority', 10, $hook, $block_name );
	}
}


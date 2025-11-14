<?php
/**
 * Fallback block registry - ensures blocks register even when dependencies fail.
 *
 * @package Yokoi
 */

namespace Yokoi;

use WP_Block_Type_Registry;
use function add_action;
use function file_exists;
use function is_dir;
use function register_block_type;
use function class_exists;
use function function_exists;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';

/**
 * Fallback registry that ensures critical blocks register even if main registry fails.
 */
class Block_Fallback_Registry {
	/**
	 * Register fallback hooks.
	 *
	 * @return void
	 */
	public function register(): void {
		// Run at priority 20 to ensure it runs after main registry (priority 10)
		add_action( 'init', array( $this, 'register_fallback_blocks' ), 20 );
	}

	/**
	 * Register blocks that may have been missed by the main registry.
	 *
	 * @return void
	 */
	public function register_fallback_blocks(): void {
		// Safety checks
		if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: WP_Block_Type_Registry class not available' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}

		try {
			$registry = WP_Block_Type_Registry::get_instance();
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to get WP_Block_Type_Registry instance: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}
		
		// Get all discovered blocks
		if ( ! function_exists( __NAMESPACE__ . '\\get_block_definitions_map' ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: get_block_definitions_map function not available' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}
		
		try {
			$blocks = get_block_definitions_map();
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to get block definitions: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}
		
		if ( ! is_array( $blocks ) || empty( $blocks ) ) {
			return;
		}
		
		foreach ( $blocks as $name => $definition ) {
			try {
				// Validate block name
				if ( ! is_string( $name ) || empty( $name ) ) {
					continue;
				}
				
				// Validate definition
				if ( ! is_array( $definition ) ) {
					continue;
				}
				
				// Skip if already registered
				try {
					if ( $registry->is_registered( $name ) ) {
						continue;
					}
				} catch ( \Throwable $e ) {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						error_log( "Yokoi: Error checking if block {$name} is registered: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					}
					continue;
				}
				
				// Skip if no valid path
				if ( empty( $definition['path'] ) || ! is_string( $definition['path'] ) || ! is_dir( $definition['path'] ) ) {
					continue;
				}
				
				// Ensure block.json exists
				$block_json = $definition['path'] . '/block.json';
				if ( ! file_exists( $block_json ) ) {
					continue;
				}
				
				// Special handling for blocks with render callbacks
				$args = $this->get_block_registration_args( $name, $definition );
				
				// Verify register_block_type function exists
				if ( ! function_exists( 'register_block_type' ) ) {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						error_log( 'Yokoi: register_block_type function not available' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					}
					continue;
				}
				
				register_block_type( $definition['path'], $args );
				
				// Verify registration succeeded
				try {
					if ( $registry->is_registered( $name ) ) {
						if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
							error_log( "Yokoi: Fallback registry registered block: {$name}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						}
					} else {
						if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
							error_log( "Yokoi: Fallback registry attempted to register {$name} but block is not in registry" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						}
					}
				} catch ( \Throwable $e ) {
					// Ignore verification errors
				}
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Failed to register block {$name} in fallback: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				// Continue to next block
				continue;
			}
		}
	}

	/**
	 * Get registration arguments for a block, including render callbacks.
	 *
	 * @param string $name       Block name.
	 * @param array  $definition Block definition.
	 * @return array Registration arguments.
	 */
	private function get_block_registration_args( string $name, array $definition ): array {
		$args = array();
		
		try {
			// Handle NavyGator render callback
			if ( 'yokoi/navygator' === $name ) {
				$renderer_file = YOKOI_PLUGIN_DIR . 'includes/Navygator/Block_Renderer.php';
				
				if ( file_exists( $renderer_file ) ) {
					try {
						require_once $renderer_file;
						
						if ( class_exists( 'Yokoi\\Navygator\\Block_Renderer' ) ) {
							$args['render_callback'] = array( 'Yokoi\\Navygator\\Block_Renderer', 'render' );
						}
					} catch ( \Throwable $e ) {
						if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
							error_log( "Yokoi: Failed to load NavyGator Block_Renderer: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						}
					}
				}
			}
			
			// Handle other blocks with render callbacks here if needed
			// Example: if ( 'yokoi/poppit' === $name ) { ... }
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( "Yokoi: Error getting registration args for {$name}: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}
		
		return $args;
	}
}


<?php
/**
 * Block registry manager.
 *
 * @package Yokoi
 */

namespace Yokoi;

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';

use function __;
use function add_action;
use function array_map;
use function array_values;
use function is_dir;
use function register_block_type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles conditional registration of Yokoi blocks.
 */
class Block_Registry {
	/**
	 * Settings API instance.
	 *
	 * @var Settings_API
	 */
	private Settings_API $settings_api;

	/**
	 * Constructor.
	 *
	 * @param Settings_API $settings_api Settings controller.
	 */
	public function __construct( Settings_API $settings_api ) {
		$this->settings_api = $settings_api;
	}

	/**
	 * Attach hooks for block registration.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_blocks' ) );
	}

	/**
	 * Return block definitions.
	 *
	 * @return array<string,array<string,string>>
	 */
	public function get_block_definitions(): array {
		return get_block_definitions_map();
	}

	/**
	 * Register enabled blocks with WordPress.
	 * Always register all blocks - filtering happens via allowed_block_types_all filter.
	 *
	 * @return void
	 */
	public function register_blocks(): void {
		// Safety checks
		if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: WP_Block_Type_Registry class not available' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}

		try {
			$blocks = $this->get_block_definitions();
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to get block definitions: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}

		if ( ! is_array( $blocks ) || empty( $blocks ) ) {
			return;
		}

		try {
			$registry = \WP_Block_Type_Registry::get_instance();
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Failed to get WP_Block_Type_Registry instance: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}

		$registered_count = 0;
		$failed_count = 0;

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

				// Skip registration if already registered (e.g., by a block-specific service)
				// But still ensure render callback is set if needed
				$already_registered = false;
				try {
					if ( $registry->is_registered( $name ) ) {
						$already_registered = true;
						// For blocks like Navygator that register early, ensure render callback is set
						if ( 'yokoi/navygator' === $name ) {
							$block_type = $registry->get_registered( $name );
							if ( $block_type && ! $block_type->render_callback ) {
								$args = $this->get_block_registration_args( $name, $definition );
								if ( ! empty( $args['render_callback'] ) ) {
									$block_type->render_callback = $args['render_callback'];
								}
							}
						}
						// Block already registered by a block-specific service - this is expected behavior
						continue;
					}
				} catch ( \Throwable $e ) {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						error_log( "Yokoi: Error checking if block {$name} is registered: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					}
					continue;
				}
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Error processing block {$name}: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				$failed_count++;
				continue;
			}

			// Always register blocks - filtering happens via allowed_block_types_all filter
			// This ensures blocks are available for client-side filtering
			if ( empty( $definition['path'] ) || ! is_dir( $definition['path'] ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Block {$name} has invalid path: " . ( $definition['path'] ?? 'null' ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				$failed_count++;
				continue;
			}

			// Verify block.json exists
			$block_json = $definition['path'] . '/block.json';
			if ( ! file_exists( $block_json ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Block {$name} missing block.json at: {$block_json}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				$failed_count++;
				continue;
			}

			// Get registration arguments (may include render callbacks)
			try {
				$args = $this->get_block_registration_args( $name, $definition );
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Failed to get registration args for {$name}: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				$args = array();
			}

			// Verify register_block_type function exists
			if ( ! function_exists( 'register_block_type' ) ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( 'Yokoi: register_block_type function not available' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				$failed_count++;
				continue;
			}

			try {
				register_block_type( $definition['path'], $args );
				$registered_count++;
				
				// Verify registration succeeded
				try {
					if ( ! $registry->is_registered( $name ) ) {
						if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
							error_log( "Yokoi: Block {$name} registration appeared to succeed but block is not in registry" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						}
						$failed_count++;
					}
				} catch ( \Throwable $e ) {
					// Ignore verification errors
				}
			} catch ( \Throwable $e ) {
				$failed_count++;
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					error_log( "Yokoi: Failed to register block {$name}: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
			}
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( sprintf( 'Yokoi: Block_Registry registered %d blocks, %d failed', $registered_count, $failed_count ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
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

		// Special handling for blocks with render callbacks
		if ( 'yokoi/navygator' === $name ) {
			$renderer_file = YOKOI_PLUGIN_DIR . 'includes/Navygator/Block_Renderer.php';

			// Try to load Block_Renderer class if it exists
			if ( file_exists( $renderer_file ) ) {
				require_once $renderer_file;
			}

			// Check if Block_Renderer class exists and use it
			if ( class_exists( 'Yokoi\\Navygator\\Block_Renderer' ) ) {
				$args['render_callback'] = array( 'Yokoi\\Navygator\\Block_Renderer', 'render' );
			}
			// If Block_Renderer doesn't exist, WordPress will use render.php from block.json
		}

		// Ensure Cozy Mode render callback is explicitly set
		if ( 'yokoi/cozy-mode' === $name ) {
			$render_file = $definition['path'] . '/render.php';
			if ( file_exists( $render_file ) ) {
				// Explicitly set render callback to ensure it works
				// The render.php file defines functions and returns the output
				$args['render_callback'] = function( $attributes, $content, $block ) use ( $render_file ) {
					// Include the render file - WordPress passes $attributes, $content, $block as variables
					// The file will return the rendered output
					$result = include $render_file;
					// Ensure we return a string
					return is_string( $result ) ? $result : '';
				};
			}
		}

		return $args;
	}

	/**
	 * Provide block metadata for editor UI.
	 *
	 * @return array<int,array<string,string>>
	 */
	public function get_block_catalog(): array {
		$definitions = $this->get_block_definitions();

		return array_values(
			array_map(
				static function ( $name, $definition ) {
					return array(
						'name'        => $name,
						'title'       => $definition['title'] ?? $name,
						'description' => $definition['description'] ?? '',
					);
				},
				array_keys( $definitions ),
				$definitions
			)
		);
	}
}

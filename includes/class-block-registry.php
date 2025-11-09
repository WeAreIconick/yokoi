<?php
/**
 * Block registry manager.
 *
 * @package Yokoi
 */

namespace Yokoi;

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
		return array(
			'yokoi/poppit' => array(
				'path'        => YOKOI_PLUGIN_DIR . 'build/blocks/poppit',
				'title'       => __( 'Poppit', 'yokoi' ),
				'description' => __( 'Build pop-ups that feel like helpful suggestions, not annoying interruptions.', 'yokoi' ),
			),
		);
	}

	/**
	 * Register enabled blocks with WordPress.
	 *
	 * @return void
	 */
	public function register_blocks(): void {
		$blocks           = $this->get_block_definitions();
		$settings         = $this->settings_api->get_stored_settings();
		$enabled_settings = $settings['blocks_enabled'] ?? array();

		foreach ( $blocks as $name => $definition ) {
			$is_enabled = $enabled_settings[ $name ] ?? true;

			if ( ! $is_enabled ) {
				continue;
			}

			if ( empty( $definition['path'] ) || ! is_dir( $definition['path'] ) ) {
				continue;
			}

			register_block_type( $definition['path'] );
		}
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

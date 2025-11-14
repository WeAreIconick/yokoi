<?php
/**
 * Z-index management to prevent conflicts between blocks.
 *
 * @package Yokoi
 */

namespace Yokoi;

use function add_filter;
use function apply_filters;
use function get_block_definitions_map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages z-index values to prevent conflicts.
 */
class Z_Index_Manager {
	/**
	 * Base z-index for Yokoi blocks.
	 *
	 * @var int
	 */
	private const BASE_Z_INDEX = 1000;

	/**
	 * Z-index increments per block.
	 *
	 * @var int
	 */
	private const Z_INDEX_INCREMENT = 10;

	/**
	 * Registered z-index values.
	 *
	 * @var array<string,int>
	 */
	private array $registered_z_indexes = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->register();
	}

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	private function register(): void {
		add_filter( 'yokoi_block_z_index', array( $this, 'get_z_index' ), 10, 2 );
		add_filter( 'yokoi_block_css_z_index', array( $this, 'get_css_z_index' ), 10, 2 );
	}

	/**
	 * Get z-index for a block.
	 *
	 * @param int    $default Default z-index.
	 * @param string $block_name Block name.
	 * @return int
	 */
	public function get_z_index( int $default, string $block_name ): int {
		if ( isset( $this->registered_z_indexes[ $block_name ] ) ) {
			return $this->registered_z_indexes[ $block_name ];
		}

		$blocks = get_block_definitions_map();
		$block_keys = array_keys( $blocks );
		$block_index = array_search( $block_name, $block_keys, true );

		if ( false === $block_index ) {
			$block_index = count( $this->registered_z_indexes );
		}

		$z_index = self::BASE_Z_INDEX + ( $block_index * self::Z_INDEX_INCREMENT );

		$this->registered_z_indexes[ $block_name ] = $z_index;

		return $z_index;
	}

	/**
	 * Get CSS z-index value.
	 *
	 * @param string $default Default CSS value.
	 * @param string $block_name Block name.
	 * @return string
	 */
	public function get_css_z_index( string $default, string $block_name ): string {
		$z_index = $this->get_z_index( 0, $block_name );
		return (string) $z_index;
	}

	/**
	 * Get z-index range for a block.
	 *
	 * @param string $block_name Block name.
	 * @return array{base: int, overlay: int, modal: int}
	 */
	public function get_z_index_range( string $block_name ): array {
		$base = $this->get_z_index( 0, $block_name );

		return array(
			'base'    => $base,
			'overlay' => $base + 1,
			'modal'   => $base + 2,
		);
	}
}


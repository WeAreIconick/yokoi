<?php
/**
 * Block usage statistics tracker.
 *
 * @package Yokoi
 */

namespace Yokoi;

use function get_option;
use function update_option;
use function do_action;
use function parse_blocks;
use function current_time;
use function wp_parse_args;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tracks block usage statistics across the site.
 */
class Block_Statistics {
	/**
	 * Option name for storing statistics.
	 */
	private const OPTION_NAME = 'yokoi_block_statistics';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'save_post', array( $this, 'track_post_blocks' ), 10, 2 );
		add_action( 'wp_insert_post', array( $this, 'track_post_blocks' ), 10, 2 );
	}

	/**
	 * Track blocks used in a post.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 *
	 * @return void
	 */
	public function track_post_blocks( int $post_id, \WP_Post $post ): void {
		if ( ! $post || 'revision' === $post->post_type ) {
			return;
		}

		$content = $post->post_content ?? '';
		if ( empty( $content ) ) {
			return;
		}

		$blocks = parse_blocks( $content );
		if ( ! is_array( $blocks ) ) {
			return;
		}

		$stats = $this->get_statistics();
		$found_blocks = array();

		// Recursively find all blocks.
		$all_blocks = $this->extract_blocks_recursive( $blocks );

		foreach ( $all_blocks as $block_name ) {
			if ( 0 !== strpos( $block_name, 'yokoi/' ) ) {
				continue;
			}

			$found_blocks[ $block_name ] = true;

			// Increment usage count.
			if ( ! isset( $stats['usage'][ $block_name ] ) ) {
				$stats['usage'][ $block_name ] = 0;
			}
			$stats['usage'][ $block_name ]++;

			// Track last used date.
			$stats['last_used'][ $block_name ] = current_time( 'mysql' );
		}

		// Track post count per block.
		foreach ( $found_blocks as $block_name => $used ) {
			if ( ! isset( $stats['post_count'][ $block_name ] ) ) {
				$stats['post_count'][ $block_name ] = array();
			}
			if ( ! in_array( $post_id, $stats['post_count'][ $block_name ], true ) ) {
				$stats['post_count'][ $block_name ][] = $post_id;
			}
		}

		// Clean up old post IDs (keep last 1000).
		foreach ( $stats['post_count'] as $block_name => $post_ids ) {
			if ( count( $post_ids ) > 1000 ) {
				$stats['post_count'][ $block_name ] = array_slice( $post_ids, -1000 );
			}
		}

		$this->save_statistics( $stats );

		// Fire analytics hook.
		do_action( 'yokoi_block_usage_tracked', $found_blocks, $post_id );
	}

	/**
	 * Get block usage statistics.
	 *
	 * @return array<string,mixed>
	 */
	public function get_statistics(): array {
		$defaults = array(
			'usage'     => array(),
			'last_used' => array(),
			'post_count' => array(),
		);

		$stats = get_option( self::OPTION_NAME, array() );
		if ( ! is_array( $stats ) ) {
			return $defaults;
		}

		return wp_parse_args( $stats, $defaults );
	}

	/**
	 * Get statistics for a specific block.
	 *
	 * @param string $block_name Block name.
	 *
	 * @return array<string,mixed>
	 */
	public function get_block_statistics( string $block_name ): array {
		$stats = $this->get_statistics();

		return array(
			'usage_count'  => $stats['usage'][ $block_name ] ?? 0,
			'last_used'    => $stats['last_used'][ $block_name ] ?? null,
			'post_count'   => count( $stats['post_count'][ $block_name ] ?? array() ),
			'post_ids'     => $stats['post_count'][ $block_name ] ?? array(),
		);
	}

	/**
	 * Save statistics.
	 *
	 * @param array<string,mixed> $stats Statistics data.
	 *
	 * @return void
	 */
	private function save_statistics( array $stats ): void {
		update_option( self::OPTION_NAME, $stats, 'no' );
	}

	/**
	 * Extract all block names recursively from block tree.
	 *
	 * @param array $blocks Block tree.
	 *
	 * @return array<int,string>
	 */
	private function extract_blocks_recursive( array $blocks ): array {
		$block_names = array();

		foreach ( $blocks as $block ) {
			$block_name = $block['blockName'] ?? '';
			if ( is_string( $block_name ) && '' !== $block_name ) {
				$block_names[] = $block_name;
			}

			// Recurse into inner blocks.
			if ( isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$block_names = array_merge( $block_names, $this->extract_blocks_recursive( $block['innerBlocks'] ) );
			}
		}

		return $block_names;
	}

	/**
	 * Reset statistics.
	 *
	 * @return void
	 */
	public function reset_statistics(): void {
		delete_option( self::OPTION_NAME );
		do_action( 'yokoi_block_statistics_reset' );
	}
}


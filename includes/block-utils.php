<?php
/**
 * Shared utilities for Yokoi block discovery.
 *
 * @package Yokoi
 */

namespace Yokoi;

use DirectoryIterator;
use function file_exists;
use function file_get_contents;
use function is_dir;
use function json_decode;
use function md5_file;
use function rtrim;
use function is_array;
use function array_map;
use function array_filter;
use function array_values;
use function function_exists;
use function get_option;
use function update_option;
use function filemtime;
use function ltrim;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const YOKOI_BLOCK_MANIFEST     = 'build/yokoi-blocks-manifest.json';
const YOKOI_BLOCK_CACHE_OPTION = 'yokoi_block_metadata_cache';

/**
 * Retrieve the absolute path to the Yokoi manifest file.
 *
 * @return string
 */
function yokoi_get_manifest_path(): string {
	return YOKOI_PLUGIN_DIR . YOKOI_BLOCK_MANIFEST;
}

/**
 * Compute a signature representing the current block bundle.
 *
 * @return string
 */
function yokoi_get_block_signature(): string {
	$manifest_path = yokoi_get_manifest_path();

	if ( file_exists( $manifest_path ) ) {
		$hash = md5_file( $manifest_path );

		if ( $hash ) {
			return $hash;
		}
	}

	$parts        = array();
	$default_dirs = yokoi_get_discovery_directories();

	foreach ( $default_dirs as $dir ) {
		if ( is_dir( $dir['base'] ) ) {
			$parts[] = $dir['base'] . ':' . filemtime( $dir['base'] );
		}
	}

	if ( empty( $parts ) ) {
		return 'yokoi-blocks-empty';
	}

	return md5( implode( '|', $parts ) );
}

/**
 * Retrieve discovery directory configuration.
 *
 * @return array<int,array<string,mixed>>
 */
function yokoi_get_discovery_directories(): array {
	return array(
		array(
			'base'          => YOKOI_PLUGIN_DIR . 'build/blocks',
			'source'        => 'build',
			'register_path' => true,
		),
		array(
			'base'          => YOKOI_PLUGIN_DIR . 'src/blocks',
			'source'        => 'src',
			'register_path' => false,
		),
	);
}

/**
 * Attempt to load block metadata from the generated manifest.
 *
 * @return array<string,array<string,mixed>>
 */
function yokoi_load_manifest_blocks(): array {
	$manifest_path = yokoi_get_manifest_path();

	if ( ! file_exists( $manifest_path ) ) {
		return array();
	}

	$raw = file_get_contents( $manifest_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents,WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown

	if ( false === $raw ) {
		return array();
	}

	$data = json_decode( $raw, true );

	if ( ! is_array( $data ) ) {
		return array();
	}

	$blocks  = array();
	$entries = array();

	if ( isset( $data['blocks'] ) && is_array( $data['blocks'] ) ) {
		$entries = $data['blocks'];
	}

	foreach ( $entries as $name => $entry ) {
		if ( is_array( $entry ) && is_string( $name ) ) {
			$relative_path = isset( $entry['path'] ) ? (string) $entry['path'] : '';
			$absolute_path = $relative_path ? YOKOI_PLUGIN_DIR . ltrim( $relative_path, '/\\' ) : null;

			$blocks[ $name ] = array(
				'name'        => $entry['name'] ?? $name,
				'title'       => $entry['title'] ?? ( $entry['name'] ?? $name ),
				'description' => $entry['description'] ?? '',
				'path'        => $absolute_path && is_dir( $absolute_path ) ? $absolute_path : null,
				'source'      => $entry['source'] ?? 'manifest',
			);
		}
	}

	return $blocks;
}

/**
 * Load block metadata from the WordPress options cache when available.
 *
 * @param string $signature Signature for current discovery context.
 *
 * @return array<string,array<string,mixed>>|null
 */
function yokoi_get_cached_metadata( string $signature ): ?array {
	if ( ! function_exists( 'get_option' ) ) {
		return null;
	}

	$cache = get_option( YOKOI_BLOCK_CACHE_OPTION );

	if ( ! is_array( $cache ) ) {
		return null;
	}

	if ( ! isset( $cache['signature'], $cache['metadata'] ) ) {
		return null;
	}

	if ( $cache['signature'] !== $signature ) {
		return null;
	}

	return is_array( $cache['metadata'] ) ? $cache['metadata'] : null;
}

/**
 * Persist block metadata to the WordPress options cache.
 *
 * @param string $signature Cache signature.
 * @param array  $metadata  Metadata payload.
 *
 * @return void
 */
function yokoi_set_cached_metadata( string $signature, array $metadata ): void {
	if ( ! function_exists( 'update_option' ) ) {
		return;
	}

	update_option(
		YOKOI_BLOCK_CACHE_OPTION,
		array(
			'signature' => $signature,
			'metadata'  => $metadata,
		),
		false
	);
}

if ( ! function_exists( __NAMESPACE__ . '\\get_all_blocks_metadata' ) ) {
	/**
	 * Discover available blocks from build (preferred) and source directories.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	function get_all_blocks_metadata(): array {
		static $cache = null;

		if ( null !== $cache ) {
			return $cache;
		}

		$signature = yokoi_get_block_signature();

		if ( $signature ) {
			$cached = yokoi_get_cached_metadata( $signature );

			if ( is_array( $cached ) ) {
				$cache = $cached;
				return $cache;
			}
		}

		$cache = yokoi_load_manifest_blocks();

		if ( ! empty( $cache ) ) {
			yokoi_set_cached_metadata( $signature, $cache );
			return $cache;
		}

		$cache          = array();
		$discovery_dirs = yokoi_get_discovery_directories();

		foreach ( $discovery_dirs as $config ) {
			$base = $config['base'];

			if ( ! is_dir( $base ) ) {
				continue;
			}

			foreach ( new DirectoryIterator( $base ) as $file_info ) {
				if ( $file_info->isDot() || ! $file_info->isDir() ) {
					continue;
				}

				$block_dir  = $file_info->getPathname();
				$block_json = $block_dir . '/block.json';

				if ( ! file_exists( $block_json ) ) {
					continue;
				}

				$raw = file_get_contents( $block_json ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents,WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
				if ( false === $raw ) {
					continue;
				}

				$data = json_decode( $raw, true );
				if ( ! is_array( $data ) || empty( $data['name'] ) ) {
					continue;
				}

				$name = (string) $data['name'];

				// Prefer build metadata over src when both exist.
				if ( isset( $cache[ $name ] ) && 'build' === $cache[ $name ]['source'] ) {
					continue;
				}

				$label           = isset( $data['title'] ) ? (string) $data['title'] : $name;
				$namespace_title = $label;

				if ( false !== strpos( $label, '/' ) ) {
					$parts           = explode( '/', $label );
					$namespace_title = trim( end( $parts ) );
				}

				$cache[ $name ] = array(
					'name'           => $name,
					'namespaceTitle' => $namespace_title,
					'title'          => $label,
					'description'    => isset( $data['description'] ) ? (string) $data['description'] : '',
					'path'           => $config['register_path'] ? $block_dir : null,
					'source'         => $config['source'],
				);
			}
		}

		yokoi_set_cached_metadata( $signature, $cache );

		return $cache;
	}
}

if ( ! function_exists( __NAMESPACE__ . '\\get_block_definitions_map' ) ) {
	/**
	 * Retrieve block definitions keyed by block name.
	 *
	 * @return array<string,array<string,string>>
	 */
	function get_block_definitions_map(): array {
		$metadata = get_all_blocks_metadata();
		$output   = array();

		foreach ( $metadata as $name => $item ) {
			if ( empty( $item['path'] ) || ! is_dir( $item['path'] ) ) {
				continue;
			}

			$output[ $name ] = array(
				'path'        => $item['path'],
				'title'       => $item['namespaceTitle'] ?? $item['title'],
				'full_title'  => $item['title'],
				'description' => $item['description'],
			);
		}

		return $output;
	}
}

if ( ! function_exists( __NAMESPACE__ . '\\get_block_catalog_entries' ) ) {
	/**
	 * Retrieve catalog-style block entries for UI display.
	 *
	 * @return array<int,array<string,string>>
	 */
	function get_block_catalog_entries(): array {
		$metadata = get_all_blocks_metadata();
		$output   = array();

		foreach ( $metadata as $name => $item ) {
			$output[] = array(
				'name'        => $name,
				'title'       => $item['title'],
				'description' => $item['description'],
			);
		}

		return $output;
	}
}

if ( ! function_exists( __NAMESPACE__ . '\\get_block_default_states' ) ) {
	/**
	 * Compute default enabled states (all true).
	 *
	 * @return array<string,bool>
	 */
	function get_block_default_states(): array {
		$metadata = get_all_blocks_metadata();
		$output   = array();

		foreach ( $metadata as $name => $item ) {
			unset( $item ); // Unused.
			$output[ $name ] = true;
		}

		return $output;
	}
}

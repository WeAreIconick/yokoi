<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Lightweight transient wrapper for Date.now caching.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use function delete_option;
use function delete_transient;
use function get_option;
use function get_transient;
use function set_transient;
use function update_option;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores Google Calendar responses in WordPress transients.
 */
class Calendar_Cache {
	private const PREFIX = 'yokoi_date_now_';
	private const KEYS_OPTION = 'yokoi_date_now_cache_keys';

	/**
	 * Fetch a cached payload.
	 *
	 * @param string $key Cache key.
	 * @return mixed
	 */
	public function get( string $key ) {
		return get_transient( self::PREFIX . $key );
	}

	/**
	 * Persist a payload to the cache.
	 *
	 * @param string $key Cache key.
	 * @param mixed  $value Value to store.
	 * @param int    $ttl Time to live.
	 * @return bool
	 */
	public function set( string $key, $value, int $ttl = 1800 ): bool {
		$stored = set_transient( self::PREFIX . $key, $value, $ttl );

		if ( $stored ) {
			$this->remember_key( $key );
		}

		return $stored;
	}

	/**
	 * Remove a cached payload.
	 *
	 * @param string $key Cache key.
	 * @return bool
	 */
	public function delete( string $key ): bool {
		$this->forget_key( $key );
		return delete_transient( self::PREFIX . $key );
	}

	/**
	 * Delete all registered cache entries.
	 *
	 * @return void
	 */
	public function delete_all(): void {
		$keys = get_option( self::KEYS_OPTION, array() );

		if ( is_array( $keys ) ) {
			foreach ( $keys as $key ) {
				delete_transient( self::PREFIX . $key );
			}
		}

		delete_option( self::KEYS_OPTION );
	}

	/**
	 * Store a cache key reference for future cleanup.
	 *
	 * @param string $key Cache key.
	 *
	 * @return void
	 */
	private function remember_key( string $key ): void {
		$keys = get_option( self::KEYS_OPTION, array() );

		if ( ! is_array( $keys ) ) {
			$keys = array();
		}

		if ( ! in_array( $key, $keys, true ) ) {
			$keys[] = $key;
			update_option( self::KEYS_OPTION, $keys, false );
		}
	}

	/**
	 * Remove a cache key reference after deletion.
	 *
	 * @param string $key Cache key.
	 *
	 * @return void
	 */
	private function forget_key( string $key ): void {
		$keys = get_option( self::KEYS_OPTION, array() );

		if ( ! is_array( $keys ) || empty( $keys ) ) {
			return;
		}

		$filtered = array_values(
			array_filter(
				$keys,
				static function ( $stored_key ) use ( $key ) {
					return $stored_key !== $key;
				}
			)
		);

		update_option( self::KEYS_OPTION, $filtered, false );
	}
}

<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Lightweight transient wrapper for Date.now caching.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use function delete_transient;
use function get_transient;
use function set_transient;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores Google Calendar responses in WordPress transients.
 */
class Calendar_Cache {
	private const PREFIX = 'yokoi_date_now_';

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
		return set_transient( self::PREFIX . $key, $value, $ttl );
	}

	/**
	 * Remove a cached payload.
	 *
	 * @param string $key Cache key.
	 * @return bool
	 */
	public function delete( string $key ): bool {
		return delete_transient( self::PREFIX . $key );
	}
}

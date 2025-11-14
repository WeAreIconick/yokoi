<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Google Calendar API wrapper for Date.now.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use DateTimeImmutable;
use WP_Error;
use function __;
use function add_query_arg;
// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Required to support Google share URLs.
use function base64_decode;
use function get_option;
use function is_wp_error;
use function rawurlencode;
use function sanitize_text_field;
use function wp_json_encode;
use function wp_parse_url;
use function wp_remote_get;
use function wp_remote_retrieve_body;
use function wp_remote_retrieve_response_code;
use function apply_filters;
use function sanitize_email;
use function filter_var;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Google Calendar API communication.
 */
class Google_Calendar_API {

	/**
	 * @var string
	 */
	private $api_key;

	/**
	 * @var Calendar_Cache
	 */
	private $cache;

	public function __construct( Calendar_Cache $cache = null ) {
		require_once YOKOI_PLUGIN_DIR . 'includes/class-api-key-encryption.php';
		$this->api_key = API_Key_Encryption::retrieve_and_decrypt();
		$this->cache   = $cache instanceof Calendar_Cache ? $cache : new Calendar_Cache();
	}

	/**
	 * Extracts a calendar ID from the provided string.
	 *
	 * @param string $input Raw calendar identifier or URL.
	 * @return string
	 */
	public function extract_calendar_id( string $input ): string {
		if ( '' === $input ) {
			return '';
		}

		// If it already contains @, validate it's a valid email format.
		if ( false !== strpos( $input, '@' ) ) {
			// Validate email format.
			if ( filter_var( $input, FILTER_VALIDATE_EMAIL ) || preg_match( '/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i', $input ) ) {
				return sanitize_email( $input );
			}
			return '';
		}

		// Validate Google Calendar URL.
		if ( false !== strpos( $input, 'calendar.google.com' ) ) {
			$parsed = wp_parse_url( $input );

			// Validate domain whitelist.
			if ( ! isset( $parsed['host'] ) || ! in_array( $parsed['host'], array( 'calendar.google.com', 'www.calendar.google.com' ), true ) ) {
				return '';
			}

			if ( isset( $parsed['query'] ) ) {
				parse_str( $parsed['query'], $query );

				if ( isset( $query['cid'] ) && is_string( $query['cid'] ) ) {
					$decoded = base64_decode( $query['cid'], true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode

					if ( $decoded && false !== strpos( $decoded, '@' ) ) {
						// Validate decoded email.
						if ( filter_var( $decoded, FILTER_VALIDATE_EMAIL ) || preg_match( '/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i', $decoded ) ) {
							return sanitize_email( $decoded );
						}
					}
				}
			}
		}

		// Try base64 decode.
		$decoded = base64_decode( $input, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode

		if ( $decoded && false !== strpos( $decoded, '@' ) ) {
			// Validate decoded email.
			if ( filter_var( $decoded, FILTER_VALIDATE_EMAIL ) || preg_match( '/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i', $decoded ) ) {
				return sanitize_email( $decoded );
			}
		}

		return '';
	}

	/**
	 * Fetch events for a date range.
	 *
	 * @param string $calendar_id Calendar identifier.
	 * @param string $start_date  Y-m-d start date.
	 * @param string $end_date    Y-m-d end date.
	 * @return array|WP_Error
	 */
	public function get_events( string $calendar_id, string $start_date, string $end_date ) {
		if ( '' === $this->api_key ) {
			return new WP_Error(
				'yokoi_date_now_missing_api_key',
				__( 'Add a Google Calendar API key in Date.now settings.', 'yokoi' )
			);
		}

		if ( '' === $calendar_id ) {
			return new WP_Error(
				'yokoi_date_now_missing_calendar_id',
				__( 'Provide a Google Calendar share URL or ID.', 'yokoi' )
			);
		}

		$calendar_id = $this->extract_calendar_id( $calendar_id );

		$cache_key = md5( $calendar_id . $start_date . $end_date );
		$cached    = $this->cache->get( $cache_key );

		if ( $cached ) {
			return $cached;
		}

		$request_url = add_query_arg(
			array(
				'key'          => $this->api_key,
				'timeMin'      => $this->format_rfc3339( $start_date ),
				'timeMax'      => $this->format_rfc3339( $end_date ),
				'singleEvents' => 'true',
				'orderBy'      => 'startTime',
				'maxResults'   => 500,
			),
			'https://www.googleapis.com/calendar/v3/calendars/' . rawurlencode( $calendar_id ) . '/events'
		);

		// Allow timeout to be filtered.
		$timeout = apply_filters( 'yokoi_calendar_timeout', 15 );

		$response = wp_remote_get(
			$request_url,
			array(
				'timeout' => $timeout,
				'headers' => array(
					'Accept' => 'application/json',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			// Log error for debugging.
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && function_exists( 'error_log' ) ) {
				error_log( 'Yokoi Calendar API Error: ' . $response->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( 200 !== $code ) {
			return new WP_Error(
				'yokoi_date_now_http_error',
				sprintf(
					/* translators: %d is HTTP status. */
					__( 'Google Calendar returned HTTP %d.', 'yokoi' ),
					$code
				)
			);
		}

		$data = json_decode( $body, true );

		if ( ! isset( $data['items'] ) || ! is_array( $data['items'] ) ) {
			return new WP_Error(
				'yokoi_date_now_invalid_payload',
				__( 'Unexpected Google Calendar response.', 'yokoi' )
			);
		}

		$events = array_values(
			array_filter(
				array_map(
					array( $this, 'normalise_event' ),
					$data['items']
				)
			)
		);

		$this->cache->set( $cache_key, $events, 1800 );

		return $events;
	}

	/**
	 * Format RFC3339 date.
	 *
	 * @param string $date Y-m-d.
	 * @return string
	 */
	private function format_rfc3339( string $date ): string {
		$dt = DateTimeImmutable::createFromFormat( 'Y-m-d', $date );

		return $dt ? $dt->format( DATE_RFC3339 ) : gmdate( DATE_RFC3339 );
	}

	/**
	 * Normalise Google event payload.
	 *
	 * @param array $event Event payload.
	 * @return array|null
	 */
	private function normalise_event( array $event ): ?array {
		if ( empty( $event['start'] ) ) {
			return null;
		}

		$start = $event['start']['dateTime'] ?? $event['start']['date'] ?? null;
		$end   = $event['end']['dateTime'] ?? $event['end']['date'] ?? null;

		if ( ! $start ) {
			return null;
		}

		return array(
			'id'          => $event['id'] ?? '',
			'title'       => $event['summary'] ?? ( $event['title'] ?? __( 'Untitled event', 'yokoi' ) ),
			'start'       => $start,
			'end'         => $end,
			'allDay'      => isset( $event['start']['date'] ),
			'description' => $event['description'] ?? '',
			'location'    => $event['location'] ?? '',
			'link'        => $event['htmlLink'] ?? '',
		);
	}

	/**
	 * Utility for exposing event data in datasets.
	 *
	 * @param array $events Events array.
	 * @return string
	 */
	public static function encode_events( array $events ): string {
		return wp_json_encode( $events, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT );
	}
}

<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Dynamic render implementation for Date.now.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use WP_Error;

use function esc_attr;
use function esc_html;
use function esc_html__;
use function get_block_wrapper_attributes;
use function ob_get_clean;
use function ob_start;
use function wp_kses_post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Outputs markup for the calendar block.
 */
class Block_Renderer {
	private const DEFAULT_START_OFFSET = '-1 month';
	private const DEFAULT_END_OFFSET   = '+3 months';

	/**
	 * Render callback entry.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content (unused).
	 * @param mixed  $block      Block instance (unused).
	 * @return string
	 */
	public static function render( array $attributes, string $content, $block ): string {
		unset( $content, $block );

		$calendar_id = $attributes['calendarId'] ?? '';
		$view_map    = array(
			'dayGridMonth' => 'month',
			'timeGridWeek' => 'week',
			'timeGridDay'  => 'day',
			'listWeek'     => 'week',
			'month'        => 'month',
			'week'         => 'week',
			'day'          => 'day',
		);

		$raw_view     = $attributes['defaultView'] ?? 'week';
		$default_view = $view_map[ $raw_view ] ?? 'week';
		$show_weekend = (bool) ( $attributes['showWeekends'] ?? true );
		$event_limit  = (int) ( $attributes['eventLimit'] ?? 3 );
		$headline     = $attributes['customHeadline'] ?? '';
		$subheadline  = $attributes['customSubheadline'] ?? '';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => 'yokoi-date-now',
			)
		);

		ob_start();

		echo '<div ' . wp_kses_post( $wrapper_attributes ) . '>';

		if ( '' === $calendar_id ) {
			self::render_notice(
				esc_html__( 'Add a Google Calendar ID or share URL in the block settings.', 'yokoi' )
			);
			echo '</div>';
			return ob_get_clean();
		}

		$api = new Google_Calendar_API();

		$events = $api->get_events(
			$calendar_id,
			gmdate( 'Y-m-d', strtotime( self::DEFAULT_START_OFFSET ) ),
			gmdate( 'Y-m-d', strtotime( self::DEFAULT_END_OFFSET ) )
		);

		if ( $events instanceof WP_Error ) {
			self::render_notice( wp_kses_post( $events->get_error_message() ), 'error' );
			echo '</div>';
			return ob_get_clean();
		}

		$dataset = array(
			'calendarId'   => esc_attr( $api->extract_calendar_id( $calendar_id ) ),
			'defaultView'  => esc_attr( $default_view ),
			'showWeekends' => $show_weekend ? '1' : '0',
			'eventLimit'   => $event_limit,
			'headline'     => esc_attr( $headline ),
			'subheadline'  => esc_attr( $subheadline ),
			'events'       => Google_Calendar_API::encode_events( $events ),
		);

		printf(
			'<div class="yokoi-date-now__card" %s></div>',
			self::format_dataset( $dataset ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);

		echo '</div>';

		return ob_get_clean();
	}

	/**
	 * Output friendly message.
	 *
	 * @param string $message Message body.
	 * @param string $type    Notice type.
	 */
	private static function render_notice( string $message, string $type = 'info' ): void {
		printf(
			'<div class="yokoi-date-now__notice yokoi-date-now__notice--%1$s">%2$s</div>',
			esc_attr( $type ),
			wp_kses_post( $message )
		);
	}

	/**
	 * Convert associative array into data attributes.
	 *
	 * @param array<string, mixed> $dataset Dataset.
	 * @return string
	 */
	private static function format_dataset( array $dataset ): string {
		$pairs = array();

		foreach ( $dataset as $key => $value ) {
			if ( is_array( $value ) || is_object( $value ) ) {
				continue;
			}

			$pairs[] = sprintf( 'data-%s="%s"', esc_attr( $key ), esc_attr( (string) $value ) );
		}

		return implode( ' ', $pairs );
	}
}

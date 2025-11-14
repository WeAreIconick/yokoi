<?php
/**
 * Block performance and health monitoring.
 *
 * @package Yokoi
 */

namespace Yokoi;

use function add_action;
use function add_filter;
use function apply_filters;
use function get_option;
use function update_option;
use function delete_option;
use function wp_json_encode;
use function wp_parse_args;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Monitors block performance and health.
 */
class Block_Monitor {
	/**
	 * Performance metrics option name.
	 *
	 * @var string
	 */
	private const METRICS_OPTION = 'yokoi_block_metrics';

	/**
	 * Error log option name.
	 *
	 * @var string
	 */
	private const ERROR_LOG_OPTION = 'yokoi_block_errors';

	/**
	 * Maximum error log entries.
	 *
	 * @var int
	 */
	private const MAX_ERROR_LOG = 100;

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
		add_action( 'wp_footer', array( $this, 'output_monitoring_script' ) );
		add_action( 'admin_footer', array( $this, 'output_monitoring_script' ) );
		add_filter( 'yokoi_block_error', array( $this, 'log_block_error' ), 10, 2 );
	}

	/**
	 * Log block error.
	 *
	 * @param string $block_name Block name.
	 * @param array  $error_data Error data.
	 * @return array
	 */
	public function log_block_error( string $block_name, array $error_data ): array {
		$errors = get_option( self::ERROR_LOG_OPTION, array() );

		$error_entry = array(
			'block'     => $block_name,
			'message'   => $error_data['message'] ?? 'Unknown error',
			'timestamp' => current_time( 'mysql' ),
			'data'      => $error_data,
		);

		$errors[] = $error_entry;

		// Keep only recent errors.
		if ( count( $errors ) > self::MAX_ERROR_LOG ) {
			$errors = array_slice( $errors, -self::MAX_ERROR_LOG );
		}

		update_option( self::ERROR_LOG_OPTION, $errors, false );

		return $error_entry;
	}

	/**
	 * Record performance metric.
	 *
	 * @param string $block_name Block name.
	 * @param string $metric_name Metric name.
	 * @param float  $value Metric value.
	 * @return void
	 */
	public function record_metric( string $block_name, string $metric_name, float $value ): void {
		$metrics = get_option( self::METRICS_OPTION, array() );

		if ( ! isset( $metrics[ $block_name ] ) ) {
			$metrics[ $block_name ] = array();
		}

		if ( ! isset( $metrics[ $block_name ][ $metric_name ] ) ) {
			$metrics[ $block_name ][ $metric_name ] = array();
		}

		$metrics[ $block_name ][ $metric_name ][] = array(
			'value'     => $value,
			'timestamp' => microtime( true ),
		);

		// Keep only recent metrics (last 100 per metric).
		if ( count( $metrics[ $block_name ][ $metric_name ] ) > 100 ) {
			$metrics[ $block_name ][ $metric_name ] = array_slice(
				$metrics[ $block_name ][ $metric_name ],
				-100
			);
		}

		update_option( self::METRICS_OPTION, $metrics, false );
	}

	/**
	 * Get block metrics.
	 *
	 * @param string $block_name Block name (optional).
	 * @return array
	 */
	public function get_metrics( string $block_name = '' ): array {
		$metrics = get_option( self::METRICS_OPTION, array() );

		if ( $block_name ) {
			return $metrics[ $block_name ] ?? array();
		}

		return $metrics;
	}

	/**
	 * Get block errors.
	 *
	 * @param string $block_name Block name (optional).
	 * @return array
	 */
	public function get_errors( string $block_name = '' ): array {
		$errors = get_option( self::ERROR_LOG_OPTION, array() );

		if ( $block_name ) {
			return array_filter(
				$errors,
				static function ( $error ) use ( $block_name ) {
					return $error['block'] === $block_name;
				}
			);
		}

		return $errors;
	}

	/**
	 * Output monitoring script.
	 *
	 * @return void
	 */
	public function output_monitoring_script(): void {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		?>
		<script>
		(function() {
			'use strict';

			// Listen for block errors.
			window.addEventListener( 'yokoi:block-error', function( event ) {
				const errorData = event.detail;
				
				// Send to server for logging.
				if ( typeof fetch !== 'undefined' ) {
					fetch( '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body: new URLSearchParams( {
							action: 'yokoi_log_block_error',
							block: errorData.block,
							error: JSON.stringify( errorData ),
							nonce: '<?php echo esc_js( wp_create_nonce( 'yokoi_block_error' ) ); ?>',
						} ),
					} ).catch( function() {
						// Silently fail if logging fails.
					} );
				}
			} );

			// Monitor performance.
			if ( 'PerformanceObserver' in window ) {
				try {
					const observer = new PerformanceObserver( function( list ) {
						for ( const entry of list.getEntries() ) {
							if ( entry.name && entry.name.includes( 'yokoi-' ) ) {
								// Extract block name from entry name.
								const match = entry.name.match( /yokoi-([^-\/]+)/ );
								if ( match ) {
									const blockName = 'yokoi/' + match[1];
									
									// Record metric.
									if ( typeof fetch !== 'undefined' ) {
										fetch( '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
											method: 'POST',
											headers: {
												'Content-Type': 'application/x-www-form-urlencoded',
											},
											body: new URLSearchParams( {
												action: 'yokoi_record_metric',
												block: blockName,
												metric: 'render_time',
												value: entry.duration,
												nonce: '<?php echo esc_js( wp_create_nonce( 'yokoi_block_metric' ) ); ?>',
											} ),
										} ).catch( function() {
											// Silently fail.
										} );
									}
								}
							}
						}
					} );

					observer.observe( { entryTypes: [ 'measure', 'navigation' ] } );
				} catch ( e ) {
					// PerformanceObserver not supported or failed.
				}
			}
		})();
		</script>
		<?php
	}
}


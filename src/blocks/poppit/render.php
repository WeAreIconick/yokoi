<?php
/**
 * Render callback for the Poppit block
 * Implements proper security practices and data validation
 *
 * @param array    $attributes Block attributes
 * @param string   $content    Block content
 * @param WP_Block $block      Block object
 *
 * @return string The block HTML
 */

// Security: Ensure we're in a WordPress context
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'yokoi_render_poppit_block' ) ) :
	/**
	 * Render the Poppit block markup.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Saved content.
	 * @param WP_Block $block      Block instance.
	 *
	 * @return string
	 */
	function yokoi_render_poppit_block( array $attributes, string $content, $block ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'Yokoi: Poppit render callback called with attributes: ' . wp_json_encode( $attributes ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
		
		$yokoi_popup_id = ! empty( $attributes['popupId'] ) ? sanitize_key( $attributes['popupId'] ) : 'popup-' . wp_generate_uuid4();
		$yokoi_popup_type = ! empty( $attributes['popupType'] ) ? sanitize_key( $attributes['popupType'] ) : 'modal';
		$yokoi_title = ! empty( $attributes['title'] ) ? wp_kses_post( $attributes['title'] ) : '';
		$yokoi_content_text = ! empty( $attributes['content'] ) ? wp_kses_post( $attributes['content'] ) : '';
		$yokoi_trigger_type = ! empty( $attributes['triggerType'] ) ? sanitize_key( $attributes['triggerType'] ) : 'time';
		$yokoi_trigger_delay = isset( $attributes['triggerDelay'] ) ? absint( $attributes['triggerDelay'] ) : 3;
		$yokoi_scroll_depth = isset( $attributes['scrollDepth'] ) ? min( max( absint( $attributes['scrollDepth'] ), 0 ), 100 ) : 50;
		$yokoi_exit_intent = ! empty( $attributes['exitIntent'] ) && $attributes['exitIntent'];
		$yokoi_show_close_button = ! isset( $attributes['showCloseButton'] ) || $attributes['showCloseButton'];
		$yokoi_overlay_opacity = isset( $attributes['overlayOpacity'] ) ? min( max( (float) $attributes['overlayOpacity'], 0 ), 1 ) : 0.8;
		$yokoi_email_enabled = ! empty( $attributes['emailEnabled'] ) && $attributes['emailEnabled'];
		$yokoi_email_placeholder = ! empty( $attributes['emailPlaceholder'] ) ? sanitize_text_field( $attributes['emailPlaceholder'] ) : __( 'Enter your email address', 'yokoi' );
		$yokoi_button_text = ! empty( $attributes['buttonText'] ) ? sanitize_text_field( $attributes['buttonText'] ) : __( 'Subscribe', 'yokoi' );
		$yokoi_animation = ! empty( $attributes['animation'] ) ? sanitize_key( $attributes['animation'] ) : 'fadeIn';
		$yokoi_width = ! empty( $attributes['width'] ) ? sanitize_text_field( $attributes['width'] ) : '500px';
		$yokoi_height = ! empty( $attributes['height'] ) ? sanitize_text_field( $attributes['height'] ) : 'auto';
		$yokoi_position = ! empty( $attributes['position'] ) ? sanitize_key( $attributes['position'] ) : 'center';
		$yokoi_allow_reset = ! empty( $attributes['allowReset'] ) && $attributes['allowReset'];
		$yokoi_reset_delay = isset( $attributes['resetDelay'] ) ? min( max( absint( $attributes['resetDelay'] ), 1 ), 10080 ) : 60; // Max 1 week.

		$yokoi_targeting_defaults = array(
			'devices'  => array( 'desktop', 'tablet', 'mobile' ),
			'userType' => 'all',
		);

		$yokoi_targeting = $yokoi_targeting_defaults;
		if ( ! empty( $attributes['targeting'] ) && is_array( $attributes['targeting'] ) ) {
			if ( isset( $attributes['targeting']['devices'] ) && is_array( $attributes['targeting']['devices'] ) ) {
				$yokoi_valid_devices    = array( 'desktop', 'tablet', 'mobile' );
				$yokoi_targeting_devices = array_intersect( $attributes['targeting']['devices'], $yokoi_valid_devices );

				if ( empty( $yokoi_targeting_devices ) ) {
					$yokoi_targeting_devices = $yokoi_targeting_defaults['devices'];
				}

				$yokoi_targeting['devices'] = $yokoi_targeting_devices;
			}

			if ( isset( $attributes['targeting']['userType'] ) ) {
				$yokoi_valid_user_types = array( 'all', 'new', 'returning' );

				if ( in_array( $attributes['targeting']['userType'], $yokoi_valid_user_types, true ) ) {
					$yokoi_targeting['userType'] = $attributes['targeting']['userType'];
				}
			}
		}

		$yokoi_valid_popup_types = array( 'modal', 'slide', 'topbar', 'bottombar', 'fullscreen' );
		if ( ! in_array( $yokoi_popup_type, $yokoi_valid_popup_types, true ) ) {
			$yokoi_popup_type = 'modal';
		}

		$yokoi_valid_trigger_types = array( 'time', 'scroll', 'exit', 'load', 'manual' );
		if ( ! in_array( $yokoi_trigger_type, $yokoi_valid_trigger_types, true ) ) {
			$yokoi_trigger_type = 'time';
		}

		$yokoi_valid_animations = array( 'fadeIn', 'slideDown', 'slideUp', 'zoomIn', 'bounceIn' );
		if ( ! in_array( $yokoi_animation, $yokoi_valid_animations, true ) ) {
			$yokoi_animation = 'fadeIn';
		}

		$yokoi_valid_positions = array( 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right' );
		if ( ! in_array( $yokoi_position, $yokoi_valid_positions, true ) ) {
			$yokoi_position = 'center';
		}

		$yokoi_width  = preg_match( '/^[0-9]+(px|%|em|rem|vw|vh|auto)$/i', $yokoi_width ) ? $yokoi_width : '500px';
		$yokoi_height = preg_match( '/^[0-9]+(px|%|em|rem|vw|vh|auto)$/i', $yokoi_height ) ? $yokoi_height : 'auto';

		if ( strlen( $yokoi_popup_id ) > 50 ) {
			$yokoi_popup_id = substr( $yokoi_popup_id, 0, 50 );
		}

		$yokoi_email_placeholder = substr( $yokoi_email_placeholder, 0, 100 );
		$yokoi_button_text       = substr( $yokoi_button_text, 0, 50 );

		$yokoi_css_vars = sprintf(
			'--popup-width: %s; --popup-height: %s;',
			esc_attr( $yokoi_width ),
			esc_attr( $yokoi_height )
		);

		$yokoi_data_attributes = array(
			'data-popup-id'         => esc_attr( $yokoi_popup_id ),
			'data-popup-type'       => esc_attr( $yokoi_popup_type ),
			'data-trigger-type'     => esc_attr( $yokoi_trigger_type ),
			'data-trigger-delay'    => esc_attr( $yokoi_trigger_delay ),
			'data-scroll-depth'     => esc_attr( $yokoi_scroll_depth ),
			'data-exit-intent'      => $yokoi_exit_intent ? 'true' : 'false',
			'data-show-close-button' => $yokoi_show_close_button ? 'true' : 'false',
			'data-overlay-opacity'  => esc_attr( $yokoi_overlay_opacity ),
			'data-email-enabled'    => $yokoi_email_enabled ? 'true' : 'false',
			'data-email-placeholder' => esc_attr( $yokoi_email_placeholder ),
			'data-button-text'      => esc_attr( $yokoi_button_text ),
			'data-targeting'        => esc_attr( wp_json_encode( $yokoi_targeting, JSON_UNESCAPED_SLASHES ) ),
			'data-animation'        => esc_attr( $yokoi_animation ),
			'data-width'            => esc_attr( $yokoi_width ),
			'data-height'           => esc_attr( $yokoi_height ),
			'data-position'         => esc_attr( $yokoi_position ),
			'data-allow-reset'      => $yokoi_allow_reset ? 'true' : 'false',
			'data-reset-delay'      => esc_attr( $yokoi_reset_delay ),
		);

		$yokoi_wrapper_attributes = get_block_wrapper_attributes(
			array_merge(
				array(
					'class' => 'poppit-block',
					'style' => $yokoi_css_vars,
				),
				$yokoi_data_attributes
			)
		);

		$yokoi_popup_data = array(
			'id'             => $yokoi_popup_id,
			'type'           => $yokoi_popup_type,
			'title'          => $yokoi_title,
			'content'        => $yokoi_content_text,
			'triggerType'    => $yokoi_trigger_type,
			'triggerDelay'   => $yokoi_trigger_delay,
			'scrollDepth'    => $yokoi_scroll_depth,
			'exitIntent'     => $yokoi_exit_intent,
			'showCloseButton' => $yokoi_show_close_button,
			'overlayOpacity' => $yokoi_overlay_opacity,
			'emailEnabled'   => $yokoi_email_enabled,
			'emailPlaceholder' => $yokoi_email_placeholder,
			'buttonText'     => $yokoi_button_text,
			'targeting'      => $yokoi_targeting,
			'animation'      => $yokoi_animation,
			'width'          => $yokoi_width,
			'height'         => $yokoi_height,
			'position'       => $yokoi_position,
			'allowReset'     => $yokoi_allow_reset,
			'resetDelay'     => $yokoi_reset_delay,
			'nonce'          => wp_create_nonce( 'yokoi_poppit_view_' . $yokoi_popup_id ),
		);

		ob_start();
		?>

		<div <?php echo wp_kses_post( $yokoi_wrapper_attributes ); ?>>
			<?php if ( ! empty( $yokoi_title ) ) : ?>
				<div class="popup-title" style="display: none;"><?php echo wp_kses_post( $yokoi_title ); ?></div>
			<?php endif; ?>

			<?php if ( ! empty( $yokoi_content_text ) ) : ?>
				<div class="popup-text" style="display: none;"><?php echo wp_kses_post( $yokoi_content_text ); ?></div>
			<?php endif; ?>

			<script type="application/json" class="popup-data">
				<?php echo wp_json_encode( $yokoi_popup_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ); ?>
			</script>
		</div>

		<?php
	$output = ob_get_clean();
	
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( sprintf( 'Yokoi: Poppit render returning HTML (length: %d chars, popup ID: %s)', strlen( $output ), $yokoi_popup_id ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
	
	return $output;
}
endif;

$yokoi_result = yokoi_render_poppit_block( $attributes ?? array(), $content ?? '', $block ?? null );

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
	error_log( sprintf( 'Yokoi: Poppit render.php final return (length: %d chars)', strlen( $yokoi_result ) ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
}

return $yokoi_result;
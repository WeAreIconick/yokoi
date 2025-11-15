<?php
/**
 * Cozy Mode block render callback.
 *
 * @package Yokoi
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'yokoi_render_cozy_mode_block_content' ) ) :
	/**
	 * Render the Cozy Mode block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 *
	 * @return string
	 */
	function yokoi_render_cozy_mode_block_content( $attributes, $content, $block ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		// Safety check - ensure we have valid attributes
		if ( ! is_array( $attributes ) ) {
			$attributes = array();
		}

		$button_label = isset( $attributes['buttonLabel'] ) ? sanitize_text_field( $attributes['buttonLabel'] ) : __( 'Read in Cozy Mode', 'yokoi' );

		$post_id = get_the_ID();

		// Enqueue assets - this ensures styles and scripts load
		yokoi_enqueue_cozy_mode_assets( (int) $post_id );

		$button  = sprintf(
			'<div class="cozy-mode-button-container">
				<button type="button" class="cozy-mode-toggle" aria-label="%1$s" data-post-id="%2$d">
					<span class="cozy-mode-icon" aria-hidden="true">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
					<span class="cozy-mode-label">%3$s</span>
				</button>
			</div>',
			esc_attr__( 'Enter Cozy Mode for better reading experience', 'yokoi' ),
			absint( $post_id ),
			esc_html( $button_label )
		);

		// Get wrapper attributes - handle case where block context might not be available
		$wrapper_attributes = '';
		if ( function_exists( 'get_block_wrapper_attributes' ) && $block instanceof \WP_Block ) {
			$wrapper_attributes = get_block_wrapper_attributes(
				array(
					'class' => 'yokoi-cozy-mode-block',
				)
			);
		} else {
			// Fallback if get_block_wrapper_attributes is not available or block context missing
			$wrapper_attributes = 'class="wp-block-yokoi-cozy-mode yokoi-cozy-mode-block"';
		}

		$output  = sprintf( '<div %s>%s</div>', $wrapper_attributes, $button );
		$output .= yokoi_get_cozy_mode_modal_markup();

		return $output;
	}
endif;

if ( ! function_exists( 'yokoi_enqueue_cozy_mode_assets' ) ) :
	/**
	 * Enqueue Cozy Mode assets.
	 *
	 * @param int $post_id Current post ID.
	 *
	 * @return void
	 */
	function yokoi_enqueue_cozy_mode_assets( int $post_id ): void {
		static $localized = false;

		$version      = defined( 'YOKOI_VERSION' ) ? YOKOI_VERSION : '1.0.0';
		$view_handle  = 'yokoi-cozy-mode-view';
		$style_handle = 'yokoi-cozy-mode-style';

		// Register and enqueue frontend styles - only on frontend, not in editor
		if ( ! is_admin() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			if ( ! wp_style_is( $style_handle, 'registered' ) ) {
				$style_path = YOKOI_PLUGIN_DIR . 'build/blocks/cozy-mode/style-index.css';
				if ( file_exists( $style_path ) ) {
					wp_register_style(
						$style_handle,
						YOKOI_PLUGIN_URL . 'build/blocks/cozy-mode/style-index.css',
						array(),
						$version
					);
				}
			}

			if ( wp_style_is( $style_handle, 'registered' ) ) {
				wp_enqueue_style( $style_handle );
			}
		}

		if ( ! wp_script_is( $view_handle, 'registered' ) ) {
			$asset_file = YOKOI_PLUGIN_DIR . 'build/blocks/cozy-mode/view.asset.php';
			$asset      = array(
				'dependencies' => array(),
				'version'      => $version,
			);

			if ( file_exists( $asset_file ) ) {
				$maybe_asset = include $asset_file;
				if ( is_array( $maybe_asset ) ) {
					$asset = wp_parse_args( $maybe_asset, $asset );
				}
			}

			wp_register_script(
				$view_handle,
				YOKOI_PLUGIN_URL . 'build/blocks/cozy-mode/view.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);
		}

		wp_enqueue_script( $view_handle );

		if ( ! $localized ) {
			$localized = true;

			$default_host    = wp_parse_url( home_url(), PHP_URL_HOST );
			$trusted_domains = array();

			if ( $default_host ) {
				$trusted_domains[] = sanitize_text_field( $default_host );
			}

			$trusted_domains = apply_filters( 'yokoi_cozy_mode_trusted_domains', $trusted_domains );

			$data = array(
				'postId'         => $post_id,
				'version'        => $version,
				'strings'        => array(
					'enterCozyMode'   => __( 'Enter Cozy Mode', 'yokoi' ),
					'closeCozyMode'   => __( 'Close Cozy Mode', 'yokoi' ),
					'readingMode'     => __( 'Reading Mode', 'yokoi' ),
					'extractionError' => __( 'Unable to extract content. Showing original content.', 'yokoi' ),
					'loading'         => __( 'Loading...', 'yokoi' ),
					'error'           => __( 'An error occurred. Please try again.', 'yokoi' ),
				),
				'trustedDomains' => array_values(
					array_unique(
						array_filter(
							array_map( 'sanitize_text_field', (array) $trusted_domains )
						)
					)
				),
			);

			wp_add_inline_script(
				$view_handle,
				'window.cozyMode = ' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP ) . ';',
				'before'
			);
		}
	}
endif;

if ( ! function_exists( 'yokoi_get_cozy_mode_modal_markup' ) ) :
	/**
	 * Return the modal markup, rendering it once per request.
	 *
	 * @return string
	 */
	function yokoi_get_cozy_mode_modal_markup(): string {
		static $rendered = false;

		if ( $rendered ) {
			return '';
		}

		$rendered = true;

		ob_start();
		?>
		<div id="cozy-mode-modal" class="cozy-mode-modal" role="dialog" aria-modal="true" aria-labelledby="cozy-mode-title" hidden>
			<div class="cozy-mode-backdrop" aria-hidden="true"></div>
			<div class="cozy-mode-container">
				<div class="cozy-mode-header">
					<h1 id="cozy-mode-title" class="cozy-mode-title"><?php esc_html_e( 'Reading Mode', 'yokoi' ); ?></h1>
					<button type="button" class="cozy-mode-close" aria-label="<?php esc_attr_e( 'Close Cozy Mode', 'yokoi' ); ?>">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="cozy-mode-content">
					<div class="cozy-mode-loading" style="display: none;">
						<div class="cozy-mode-spinner"></div>
						<p><?php esc_html_e( 'Loading content...', 'yokoi' ); ?></p>
					</div>
					<div class="cozy-mode-article">
						<!-- Content injected via Cozy Mode script -->
					</div>
				</div>
				<div class="cozy-mode-controls">
					<button type="button" class="cozy-mode-control cozy-mode-font-decrease" aria-label="<?php esc_attr_e( 'Decrease font size', 'yokoi' ); ?>">A-</button>
					<button type="button" class="cozy-mode-control cozy-mode-font-reset" aria-label="<?php esc_attr_e( 'Reset font size', 'yokoi' ); ?>">A</button>
					<button type="button" class="cozy-mode-control cozy-mode-font-increase" aria-label="<?php esc_attr_e( 'Increase font size', 'yokoi' ); ?>">A+</button>
				</div>
			</div>
		</div>
		<?php

		return wp_kses_post( ob_get_clean() );
	}
endif;

return yokoi_render_cozy_mode_block_content( $attributes ?? array(), $content ?? '', $block ?? null );


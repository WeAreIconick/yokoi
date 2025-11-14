<?php
/**
 * Render callback for the Logo Parade block.
 *
 * @package Yokoi
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$yokoi_logos                 = isset( $attributes['logos'] ) && is_array( $attributes['logos'] ) ? $attributes['logos'] : array();
$yokoi_rotation_speed        = isset( $attributes['rotationSpeed'] ) ? absint( $attributes['rotationSpeed'] ) : 3000;
$yokoi_transition_duration   = isset( $attributes['transitionDuration'] ) ? absint( $attributes['transitionDuration'] ) : 500;
$yokoi_pause_on_hover        = isset( $attributes['pauseOnHover'] ) ? (bool) $attributes['pauseOnHover'] : true;
$yokoi_logos_per_view        = isset( $attributes['logosPerView'] ) ? max( 1, min( 8, absint( $attributes['logosPerView'] ) ) ) : 4;
$yokoi_mobile_logos_per_view = isset( $attributes['mobileLogosPerView'] ) ? max( 1, min( 4, absint( $attributes['mobileLogosPerView'] ) ) ) : 2;
$yokoi_hide_on_mobile        = ! empty( $attributes['hideOnMobile'] );
$yokoi_logo_height           = isset( $attributes['logoHeight'] ) ? sanitize_text_field( $attributes['logoHeight'] ) : '60px';
$yokoi_gap_between_logos     = isset( $attributes['gapBetweenLogos'] ) ? absint( $attributes['gapBetweenLogos'] ) : 40;
$yokoi_background_color      = isset( $attributes['backgroundColor'] ) ? sanitize_text_field( $attributes['backgroundColor'] ) : '';
$yokoi_alignment             = isset( $attributes['alignment'] ) ? sanitize_text_field( $attributes['alignment'] ) : 'center';

if ( ! in_array( $yokoi_alignment, array( 'left', 'center', 'right' ), true ) ) {
	$yokoi_alignment = 'center';
}

$yokoi_valid_logos = array();

foreach ( $yokoi_logos as $yokoi_logo ) {
	if ( ! is_array( $yokoi_logo ) || empty( $yokoi_logo['url'] ) ) {
		continue;
	}

	$yokoi_url = esc_url_raw( $yokoi_logo['url'] );

	if ( '' === $yokoi_url ) {
		continue;
	}

	$yokoi_valid_logos[] = array(
		'id'      => isset( $yokoi_logo['id'] ) ? absint( $yokoi_logo['id'] ) : 0,
		'url'     => $yokoi_url,
		'alt'     => isset( $yokoi_logo['alt'] ) ? sanitize_text_field( $yokoi_logo['alt'] ) : '',
		'linkUrl' => isset( $yokoi_logo['linkUrl'] ) ? esc_url_raw( $yokoi_logo['linkUrl'] ) : '',
		'newTab'  => ! empty( $yokoi_logo['newTab'] ),
	);
}

if ( empty( $yokoi_valid_logos ) ) {
	return '<!-- Yokoi Logo Parade: no valid logos -->';
}

$yokoi_wrapper_classes = array( 'wp-block-yokoi-logo-parade' );

if ( $yokoi_hide_on_mobile ) {
	$yokoi_wrapper_classes[] = 'logo-parade--hidden-mobile';
}

$yokoi_style_rules = array(
	'--logo-height'                   => $yokoi_logo_height,
	'--logo-parade-gap'               => $yokoi_gap_between_logos . 'px',
	'--logos-per-view'                => (string) $yokoi_logos_per_view,
	'--logo-parade-current-per-view'  => (string) $yokoi_logos_per_view,
	'--mobile-logos-per-view'         => (string) $yokoi_mobile_logos_per_view,
	'text-align'                      => $yokoi_alignment,
);

if ( $yokoi_background_color && 'transparent' !== strtolower( $yokoi_background_color ) ) {
	$yokoi_style_rules['background-color'] = $yokoi_background_color;
}

$yokoi_style_attribute = '';

foreach ( $yokoi_style_rules as $yokoi_property => $yokoi_value ) {
	$yokoi_style_attribute .= sprintf( '%s: %s; ', esc_attr( $yokoi_property ), esc_attr( $yokoi_value ) );
}

$yokoi_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                     => implode( ' ', array_map( 'sanitize_html_class', $yokoi_wrapper_classes ) ),
		'data-rotation-speed'       => esc_attr( $yokoi_rotation_speed ),
		'data-transition-duration'  => esc_attr( $yokoi_transition_duration ),
		'data-pause-on-hover'       => $yokoi_pause_on_hover ? 'true' : 'false',
		'data-logos-per-view'       => esc_attr( $yokoi_logos_per_view ),
		'data-original-count'       => esc_attr( count( $yokoi_valid_logos ) ),
		'style'                     => $yokoi_style_attribute,
	)
);

ob_start();
?>
<div <?php echo wp_kses_post( $yokoi_wrapper_attributes ); ?>>
	<div class="logo-parade-track">
		<?php foreach ( $yokoi_valid_logos as $yokoi_logo ) : ?>
			<div class="logo-parade-item">
				<?php if ( $yokoi_logo['linkUrl'] ) : ?>
					<a
						href="<?php echo esc_url( $yokoi_logo['linkUrl'] ); ?>"
						<?php echo $yokoi_logo['newTab'] ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
						aria-label="<?php echo esc_attr( $yokoi_logo['alt'] ?: __( 'Partner logo', 'yokoi' ) ); ?>"
					>
						<img
							src="<?php echo esc_url( $yokoi_logo['url'] ); ?>"
							alt="<?php echo esc_attr( $yokoi_logo['alt'] ); ?>"
							loading="lazy"
							decoding="async"
						/>
					</a>
				<?php else : ?>
					<span>
						<img
							src="<?php echo esc_url( $yokoi_logo['url'] ); ?>"
							alt="<?php echo esc_attr( $yokoi_logo['alt'] ); ?>"
							loading="lazy"
							decoding="async"
						/>
					</span>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
		<?php
		$yokoi_duplicate_sets = max( 2, ceil( ( ( $yokoi_logos_per_view * 2 ) + count( $yokoi_valid_logos ) ) / count( $yokoi_valid_logos ) ) );

		for ( $yokoi_i = 0; $yokoi_i < $yokoi_duplicate_sets; $yokoi_i++ ) :
			foreach ( $yokoi_valid_logos as $yokoi_logo ) :
				?>
				<div class="logo-parade-item" aria-hidden="true">
					<?php if ( $yokoi_logo['linkUrl'] ) : ?>
						<a
							href="<?php echo esc_url( $yokoi_logo['linkUrl'] ); ?>"
							<?php echo $yokoi_logo['newTab'] ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
							tabindex="-1"
						>
							<img
								src="<?php echo esc_url( $yokoi_logo['url'] ); ?>"
								alt=""
								loading="lazy"
								decoding="async"
							/>
						</a>
					<?php else : ?>
						<span>
							<img
								src="<?php echo esc_url( $yokoi_logo['url'] ); ?>"
								alt=""
								loading="lazy"
								decoding="async"
							/>
						</span>
					<?php endif; ?>
				</div>
				<?php
			endforeach;
		endfor;
		?>
	</div>
</div>
<?php
return ob_get_clean();


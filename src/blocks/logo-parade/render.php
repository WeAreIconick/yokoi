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

$logos                 = isset( $attributes['logos'] ) && is_array( $attributes['logos'] ) ? $attributes['logos'] : array();
$rotation_speed        = isset( $attributes['rotationSpeed'] ) ? absint( $attributes['rotationSpeed'] ) : 3000;
$transition_duration   = isset( $attributes['transitionDuration'] ) ? absint( $attributes['transitionDuration'] ) : 500;
$pause_on_hover        = isset( $attributes['pauseOnHover'] ) ? (bool) $attributes['pauseOnHover'] : true;
$logos_per_view        = isset( $attributes['logosPerView'] ) ? max( 1, min( 8, absint( $attributes['logosPerView'] ) ) ) : 4;
$mobile_logos_per_view = isset( $attributes['mobileLogosPerView'] ) ? max( 1, min( 4, absint( $attributes['mobileLogosPerView'] ) ) ) : 2;
$hide_on_mobile        = ! empty( $attributes['hideOnMobile'] );
$logo_height           = isset( $attributes['logoHeight'] ) ? sanitize_text_field( $attributes['logoHeight'] ) : '60px';
$gap_between_logos     = isset( $attributes['gapBetweenLogos'] ) ? absint( $attributes['gapBetweenLogos'] ) : 40;
$background_color      = isset( $attributes['backgroundColor'] ) ? sanitize_text_field( $attributes['backgroundColor'] ) : '';
$alignment             = isset( $attributes['alignment'] ) ? sanitize_text_field( $attributes['alignment'] ) : 'center';
$animation_direction   = isset( $attributes['animationDirection'] ) ? sanitize_text_field( $attributes['animationDirection'] ) : 'left';
$animation_type        = isset( $attributes['animationType'] ) ? sanitize_text_field( $attributes['animationType'] ) : 'continuous';
$auto_play             = isset( $attributes['autoPlay'] ) ? (bool) $attributes['autoPlay'] : true;
$grayscale_effect      = isset( $attributes['grayscaleEffect'] ) ? (bool) $attributes['grayscaleEffect'] : true;
$hover_effect          = isset( $attributes['hoverEffect'] ) ? sanitize_text_field( $attributes['hoverEffect'] ) : 'colorize';
$logo_opacity          = isset( $attributes['logoOpacity'] ) ? max( 0, min( 100, absint( $attributes['logoOpacity'] ) ) ) : 75;
$logo_border           = isset( $attributes['logoBorder'] ) ? (bool) $attributes['logoBorder'] : false;
$logo_padding          = isset( $attributes['logoPadding'] ) ? max( 0, min( 40, absint( $attributes['logoPadding'] ) ) ) : 0;
$show_indicators       = isset( $attributes['showIndicators'] ) ? (bool) $attributes['showIndicators'] : false;

if ( ! in_array( $alignment, array( 'left', 'center', 'right' ), true ) ) {
	$alignment = 'center';
}

if ( ! in_array( $animation_direction, array( 'left', 'right', 'bidirectional' ), true ) ) {
	$animation_direction = 'left';
}

if ( ! in_array( $animation_type, array( 'continuous', 'carousel' ), true ) ) {
	$animation_type = 'continuous';
}

if ( ! in_array( $hover_effect, array( 'none', 'colorize', 'scale', 'lift' ), true ) ) {
	$hover_effect = 'colorize';
}

$valid_logos = array();

foreach ( $logos as $logo ) {
	if ( ! is_array( $logo ) || empty( $logo['url'] ) ) {
		continue;
	}

	$url = esc_url_raw( $logo['url'] );

	if ( '' === $url ) {
		continue;
	}

	$valid_logos[] = array(
		'id'      => isset( $logo['id'] ) ? absint( $logo['id'] ) : 0,
		'url'     => $url,
		'alt'     => isset( $logo['alt'] ) ? sanitize_text_field( $logo['alt'] ) : '',
		'linkUrl' => isset( $logo['linkUrl'] ) ? esc_url_raw( $logo['linkUrl'] ) : '',
		'newTab'  => ! empty( $logo['newTab'] ),
	);
}

if ( empty( $valid_logos ) ) {
	return '<!-- Yokoi Logo Parade: no valid logos -->';
}

$wrapper_classes = array( 'wp-block-yokoi-logo-parade' );

if ( $hide_on_mobile ) {
	$wrapper_classes[] = 'logo-parade--hidden-mobile';
}

$style_rules = array(
	'--logo-height'                   => $logo_height,
	'--logo-parade-gap'               => $gap_between_logos . 'px',
	'--logos-per-view'                => (string) $logos_per_view,
	'--logo-parade-current-per-view'  => (string) $logos_per_view,
	'--mobile-logos-per-view'         => (string) $mobile_logos_per_view,
	'--logo-opacity'                  => (string) ( $logo_opacity / 100 ),
	'--logo-padding'                  => (string) $logo_padding . 'px',
	'text-align'                      => $alignment,
);

if ( $background_color && 'transparent' !== strtolower( $background_color ) ) {
	$style_rules['background-color'] = $background_color;
}

$style_attribute = '';

foreach ( $style_rules as $property => $value ) {
	$style_attribute .= sprintf( '%s: %s; ', esc_attr( $property ), esc_attr( $value ) );
}

$wrapper_classes[] = 'logo-parade-grayscale-' . ( $grayscale_effect ? 'enabled' : 'disabled' );
$wrapper_classes[] = 'logo-parade-hover-' . sanitize_html_class( $hover_effect );
$wrapper_classes[] = 'logo-parade-border-' . ( $logo_border ? 'enabled' : 'disabled' );

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                     => implode( ' ', array_map( 'sanitize_html_class', $wrapper_classes ) ),
		'data-rotation-speed'       => esc_attr( $rotation_speed ),
		'data-transition-duration'  => esc_attr( $transition_duration ),
		'data-pause-on-hover'       => $pause_on_hover ? 'true' : 'false',
		'data-logos-per-view'       => esc_attr( $logos_per_view ),
		'data-original-count'       => esc_attr( count( $valid_logos ) ),
		'data-animation-direction'  => esc_attr( $animation_direction ),
		'data-animation-type'       => esc_attr( $animation_type ),
		'data-auto-play'            => $auto_play ? 'true' : 'false',
		'style'                     => $style_attribute,
	)
);

ob_start();
?>
<div <?php echo $wrapper_attributes; ?>>
	<div class="logo-parade-track">
		<?php foreach ( $valid_logos as $logo ) : ?>
			<div class="logo-parade-item">
				<?php if ( $logo['linkUrl'] ) : ?>
					<a
						href="<?php echo esc_url( $logo['linkUrl'] ); ?>"
						<?php echo $logo['newTab'] ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
						aria-label="<?php echo esc_attr( $logo['alt'] ?: __( 'Partner logo', 'yokoi' ) ); ?>"
					>
						<img
							src="<?php echo esc_url( $logo['url'] ); ?>"
							alt="<?php echo esc_attr( $logo['alt'] ); ?>"
							loading="lazy"
							decoding="async"
						/>
					</a>
				<?php else : ?>
					<span>
						<img
							src="<?php echo esc_url( $logo['url'] ); ?>"
							alt="<?php echo esc_attr( $logo['alt'] ); ?>"
							loading="lazy"
							decoding="async"
						/>
					</span>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
		<?php
		$duplicate_sets = max( 2, ceil( ( ( $logos_per_view * 2 ) + count( $valid_logos ) ) / count( $valid_logos ) ) );

		for ( $i = 0; $i < $duplicate_sets; $i++ ) :
			foreach ( $valid_logos as $logo ) :
				?>
				<div class="logo-parade-item" aria-hidden="true">
					<?php if ( $logo['linkUrl'] ) : ?>
						<a
							href="<?php echo esc_url( $logo['linkUrl'] ); ?>"
							<?php echo $logo['newTab'] ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
							tabindex="-1"
						>
							<img
								src="<?php echo esc_url( $logo['url'] ); ?>"
								alt=""
								loading="lazy"
								decoding="async"
							/>
						</a>
					<?php else : ?>
						<span>
							<img
								src="<?php echo esc_url( $logo['url'] ); ?>"
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


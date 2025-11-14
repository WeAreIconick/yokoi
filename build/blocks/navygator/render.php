<?php
/**
 * Render callback for the NavyGator table of contents block.
 *
 * @package Yokoi
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Yokoi\Navygator\Block_Renderer;

return Block_Renderer::render( $attributes ?? array(), $content ?? '', $block ?? null );


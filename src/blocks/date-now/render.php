<?php
/**
 * Render callback proxy for the Date.now calendar block.
 *
 * @package Yokoi
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Yokoi\Date_Now\Block_Renderer;

return Block_Renderer::render( $attributes ?? array(), $content ?? '', $block ?? null );


<?php
/**
 * Yokoi bootstrap loader.
 *
 * @package Yokoi
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';
require_once YOKOI_PLUGIN_DIR . 'includes/class-settings-api.php';
require_once YOKOI_PLUGIN_DIR . 'includes/class-block-registry.php';
require_once YOKOI_PLUGIN_DIR . 'includes/class-block-catalog-api.php';

require_once YOKOI_PLUGIN_DIR . 'includes/Date_Now/Calendar_Cache.php';
require_once YOKOI_PLUGIN_DIR . 'includes/Date_Now/Google_Calendar_API.php';
require_once YOKOI_PLUGIN_DIR . 'includes/Date_Now/Block_Renderer.php';
require_once YOKOI_PLUGIN_DIR . 'includes/Date_Now/Service.php';


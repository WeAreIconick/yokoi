<?php
/**
 * PHPUnit bootstrap for Yokoi.
 */

declare(strict_types=1);

$project_root = dirname(__DIR__);

require_once $project_root . '/vendor/autoload.php';

if ( ! defined( 'YOKOI_PLUGIN_DIR' ) ) {
	define( 'YOKOI_PLUGIN_DIR', $project_root . '/' );
}

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';


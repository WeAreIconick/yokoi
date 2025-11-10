<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Bootstraps the Date.now block within Yokoi.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use function add_action;
use function has_block;
use function register_block_type;
use function wp_enqueue_script;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main service class responsible for wiring hooks.
 */
class Service {
	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'on_init' ) );
		add_action( 'admin_menu', array( $this, 'register_settings_page' ), 20 );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_frontend' ) );
	}

	/**
	 * Register block type via metadata.
	 */
	public function on_init(): void {
		register_block_type(
			YOKOI_PLUGIN_DIR . 'build/blocks/date-now',
			array(
				'render_callback' => array( Block_Renderer::class, 'render' ),
			)
		);
	}

	/**
	 * Makes the settings page available.
	 */
	public function register_settings_page(): void {
		( new Settings_Page() )->hooks();
	}

	/**
	 * Enqueue front-end assets conditionally when block is present.
	 */
	public function enqueue_frontend(): void {
		if ( ! has_block( 'yokoi/date-now' ) ) {
			return;
		}

		$asset = include YOKOI_PLUGIN_DIR . 'build/blocks/date-now/view.asset.php';

		wp_enqueue_style(
			'yokoi-date-now-style',
			YOKOI_PLUGIN_URL . 'build/blocks/date-now/style-index.css',
			array(),
			$asset['version']
		);

		wp_enqueue_script(
			'yokoi-date-now-view',
			YOKOI_PLUGIN_URL . 'build/blocks/date-now/view.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
}

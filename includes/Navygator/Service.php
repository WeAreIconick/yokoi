<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Bootstraps the NavyGator block within Yokoi.
 *
 * @package Yokoi
 */

namespace Yokoi\Navygator;

use WP_Block_Type_Registry;
use function add_action;
use function add_filter;
use function has_block;
use function file_exists;
use function register_block_type;
use function wp_enqueue_script;
use function wp_enqueue_style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once YOKOI_PLUGIN_DIR . 'includes/class-settings-api.php';

/**
 * Main service class responsible for wiring hooks.
 */
class Service {
	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'on_init' ), 5 ); // Priority 5 to run before Block_Registry (default 10)
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend' ) );
		add_filter( 'the_content', array( $this, 'add_heading_ids' ), 10 );
	}

	/**
	 * Register block type via metadata.
	 * Always register the block - filtering happens via allowed_block_types_all filter.
	 * Note: Block_Registry will also try to register this block, so we check first.
	 */
	public function on_init(): void {
		$registry = WP_Block_Type_Registry::get_instance();

		// Check if already registered (e.g., by Block_Registry)
		if ( $registry->is_registered( 'yokoi/navygator' ) ) {
			// Ensure render callback is set even if registered elsewhere
			$block_type = $registry->get_registered( 'yokoi/navygator' );
			if ( $block_type && ! $block_type->render_callback ) {
				$block_type->render_callback = array( Block_Renderer::class, 'render' );
			}
			return;
		}

		$block_dir = YOKOI_PLUGIN_DIR . 'build/blocks/navygator';

		if ( ! file_exists( $block_dir . '/block.json' ) ) {
			return;
		}

		// Load Block_Renderer if not already loaded
		$renderer_file = YOKOI_PLUGIN_DIR . 'includes/Navygator/Block_Renderer.php';
		if ( file_exists( $renderer_file ) && ! class_exists( 'Yokoi\\Navygator\\Block_Renderer' ) ) {
			require_once $renderer_file;
		}

		// Always register the block - filtering happens via allowed_block_types_all filter
		register_block_type(
			$block_dir,
			array(
				'render_callback' => array( Block_Renderer::class, 'render' ),
			)
		);
	}

	/**
	 * Enqueue front-end assets conditionally when block is present.
	 */
	public function enqueue_frontend(): void {
		if ( ! is_singular() || ! has_block( 'yokoi/navygator' ) ) {
			return;
		}

		$view_asset_file = YOKOI_PLUGIN_DIR . 'build/blocks/navygator/view.asset.php';
		if ( file_exists( $view_asset_file ) ) {
			$view_asset = require $view_asset_file;

			wp_enqueue_script(
				'yokoi-navygator-view',
				YOKOI_PLUGIN_URL . 'build/blocks/navygator/view.js',
				$view_asset['dependencies'],
				$view_asset['version'],
				true
			);
		}

		$style_css_path = YOKOI_PLUGIN_DIR . 'build/blocks/navygator/style-index.css';
		if ( file_exists( $style_css_path ) ) {
			wp_enqueue_style(
				'yokoi-navygator-style',
				YOKOI_PLUGIN_URL . 'build/blocks/navygator/style-index.css',
				array(),
				$view_asset['version'] ?? YOKOI_VERSION
			);
		}
	}

	/**
	 * Add IDs to headings in content if NavyGator block is present.
	 *
	 * @param string $content Post content.
	 * @return string
	 */
	public function add_heading_ids( string $content ): string {
		if ( ! is_singular() ) {
			return $content;
		}

		if ( ! has_block( 'yokoi/navygator' ) ) {
			return $content;
		}

		$dom = new \DOMDocument();
		libxml_use_internal_errors( true );
		$dom->loadHTML( '<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();

		$heading_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
		$modified     = false;

		foreach ( $heading_tags as $tag ) {
			$elements = $dom->getElementsByTagName( $tag );

			foreach ( $elements as $element ) {
				if ( $element->hasAttribute( 'id' ) ) {
					continue;
				}

				$text = trim( $element->textContent );
				if ( empty( $text ) ) {
					continue;
				}

				$id = $this->generate_heading_id( $text );
				$element->setAttribute( 'id', $id );
				$modified = true;
			}
		}

		if ( $modified ) {
			$content = $dom->saveHTML();
		}

		return $content;
	}

	/**
	 * Generate heading ID from text.
	 *
	 * @param string $text Heading text.
	 * @return string
	 */
	private function generate_heading_id( string $text ): string {
		$id = strtolower( $text );
		$id = preg_replace( '/[^a-z0-9\s-]/', '', $id );
		$id = preg_replace( '/\s+/', '-', $id );
		$id = preg_replace( '/-+/', '-', $id );
		$id = trim( $id, '-' );

		if ( empty( $id ) ) {
			$id = 'heading-' . wp_rand( 1000, 9999 );
		}

		return $id;
	}
}


<?php
/**
 * REST controller for block catalog data.
 *
 * @package Yokoi
 */

namespace Yokoi;

use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use function add_action;
use function current_user_can;
use function register_rest_route;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';

/**
 * Exposes a REST endpoint for retrieving block catalog metadata.
 */
class Block_Catalog_API {
	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the REST route for block catalog.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			Settings_API::REST_NAMESPACE,
			'/blocks',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_blocks' ),
					'permission_callback' => array( $this, 'can_read_blocks' ),
				),
			)
		);
	}

	/**
	 * Permission check for reading block catalog.
	 *
	 * @return bool
	 */
	public function can_read_blocks(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * REST callback returning block catalog entries.
	 *
	 * @param WP_REST_Request $request Request instance.
	 *
	 * @return WP_REST_Response
	 */
	public function get_blocks( WP_REST_Request $request ): WP_REST_Response { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		$catalog = get_block_catalog_entries();

		return new WP_REST_Response( $catalog, 200 );
	}
}

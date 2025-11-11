<?php
/**
 * REST API settings controller.
 *
 * @package Yokoi
 */

namespace Yokoi;

require_once YOKOI_PLUGIN_DIR . 'includes/block-utils.php';

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use function add_action;
use function add_option;
use function current_user_can;
use function get_option;
use function register_setting;
use function rest_sanitize_boolean;
use function sanitize_text_field;
use function register_rest_route;
use function update_option;
use function wp_parse_args;
use function __;
use function wp_verify_nonce;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages Yokoi site-wide settings via the WordPress REST API.
 */
class Settings_API {
	/**
	 * Option name used to persist plugin settings.
	 */
	public const OPTION_NAME = 'yokoi_settings';

	/**
	 * REST namespace.
	 */
	public const REST_NAMESPACE = 'yokoi/v1';

	/**
	 * Default settings structure.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_default_settings(): array {
		return array(
			'blocks_enabled'      => get_block_default_states(),
			'default_configs'     => array(),
			'visibility_controls' => array(),
			'date_now_api_key'    => sanitize_text_field( (string) get_option( 'yokoi_date_now_api_key', '' ) ),
		);
	}

	/**
	 * Ensure defaults exist on activation.
	 *
	 * @return void
	 */
	public static function seed_defaults(): void {
		if ( false === get_option( self::OPTION_NAME, false ) ) {
			add_option( self::OPTION_NAME, self::get_default_settings(), '', 'yes' );
		}
	}

	/**
	 * Attach hooks for the REST API endpoints.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_action( 'init', array( $this, 'register_settings_option' ) );
	}

	/**
	 * Register the Yokoi settings option with WordPress.
	 *
	 * @return void
	 */
	public function register_settings_option(): void {
		register_setting(
			'general',
			self::OPTION_NAME,
			array(
				'type'              => 'object',
				'sanitize_callback' => array( $this, 'sanitize_settings_option' ),
				'default'           => self::get_default_settings(),
				'auth_callback'     => array( $this, 'can_manage_settings' ),
				'show_in_rest'      => array(
					'name'   => self::OPTION_NAME,
					'schema' => $this->get_settings_schema(),
				),
			)
		);
	}

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
					'args'                => $this->get_endpoint_args(),
				),
			),
			true
		);
	}

	/**
	 * Retrieve the registered endpoint arguments.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	private function get_endpoint_args(): array {
		return array(
			'blocks_enabled'      => array(
				'required'          => false,
				'type'              => 'object',
				'description'       => __( 'Mapping of block names to enabled state.', 'yokoi' ),
				'validate_callback' => array( $this, 'validate_blocks_enabled' ),
				'sanitize_callback' => array( $this, 'sanitize_blocks_enabled' ),
			),
			'default_configs'     => array(
				'required'          => false,
				'type'              => 'object',
				'description'       => __( 'Default configuration payloads per block.', 'yokoi' ),
				'sanitize_callback' => array( $this, 'sanitize_recursive' ),
			),
			'visibility_controls' => array(
				'required'          => false,
				'type'              => 'object',
				'description'       => __( 'Role-based or condition-based visibility controls.', 'yokoi' ),
				'sanitize_callback' => array( $this, 'sanitize_recursive' ),
			),
			'nonce'               => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => __( 'Nonce used to validate Yokoi settings updates.', 'yokoi' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'date_now_api_key'    => array(
				'required'          => false,
				'type'              => 'string',
				'description'       => __( 'Google Calendar API key used by the Date.now block.', 'yokoi' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	/**
	 * Determine if the current user may manage settings.
	 *
	 * @return bool
	 */
	public function can_manage_settings(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Retrieve stored settings merged with defaults.
	 *
	 * @return array<string,mixed>
	 */
	public function get_stored_settings(): array {
		$stored = get_option( self::OPTION_NAME, array() );

		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$defaults = self::get_default_settings();
		$settings = wp_parse_args( $stored, $defaults );

		$settings['blocks_enabled']      = wp_parse_args( $settings['blocks_enabled'], $defaults['blocks_enabled'] );
		$settings['default_configs']     = wp_parse_args( $settings['default_configs'], $defaults['default_configs'] );
		$settings['visibility_controls'] = wp_parse_args( $settings['visibility_controls'], $defaults['visibility_controls'] );
		$settings['date_now_api_key']    = sanitize_text_field( (string) $settings['date_now_api_key'] );

		return $settings;
	}

	/**
	 * GET callback for `/settings`.
	 *
	 * @param WP_REST_Request $request Incoming request (unused).
	 *
	 * @return WP_REST_Response
	 */
	public function get_settings( WP_REST_Request $request ): WP_REST_Response { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		$settings = $this->get_stored_settings();

		return new WP_REST_Response( $settings, 200 );
	}

	/**
	 * POST callback for `/settings`.
	 *
	 * @param WP_REST_Request $request Incoming request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_settings( WP_REST_Request $request ) {
		$current_settings = $this->get_stored_settings();
		$new_settings     = $current_settings;
		$nonce            = $request->get_param( 'nonce' );

		if ( ! is_string( $nonce ) || ! wp_verify_nonce( $nonce, 'yokoi_settings' ) ) {
			return new WP_Error(
				'yokoi_invalid_nonce',
				__( 'Your session has expired. Please refresh and try again.', 'yokoi' ),
				array( 'status' => 403 )
			);
		}

		if ( null !== $request->get_param( 'blocks_enabled' ) ) {
			$new_settings['blocks_enabled'] = $request->get_param( 'blocks_enabled' );
		}

		if ( null !== $request->get_param( 'default_configs' ) ) {
			$new_settings['default_configs'] = $request->get_param( 'default_configs' );
		}

		if ( null !== $request->get_param( 'visibility_controls' ) ) {
			$new_settings['visibility_controls'] = $request->get_param( 'visibility_controls' );
		}

		if ( null !== $request->get_param( 'date_now_api_key' ) ) {
			$new_settings['date_now_api_key'] = sanitize_text_field( (string) $request->get_param( 'date_now_api_key' ) );
			update_option( 'yokoi_date_now_api_key', $new_settings['date_now_api_key'], 'yes' );
		}

		update_option( self::OPTION_NAME, $new_settings, 'yes' );

		$response = array(
			'data'    => $new_settings,
			'success' => true,
		);

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * Sanitize the settings option payload.
	 *
	 * @param mixed $value Value provided by WordPress.
	 *
	 * @return array<string,mixed>
	 */
	public function sanitize_settings_option( $value ): array {
		$defaults = self::get_default_settings();

		if ( ! is_array( $value ) ) {
			return $defaults;
		}

		$sanitized = $defaults;

		if ( array_key_exists( 'blocks_enabled', $value ) ) {
			$sanitized['blocks_enabled'] = $this->sanitize_blocks_enabled( $value['blocks_enabled'] );
		}

		if ( array_key_exists( 'default_configs', $value ) ) {
			$sanitized['default_configs'] = $this->sanitize_recursive( $value['default_configs'] );
		}

		if ( array_key_exists( 'visibility_controls', $value ) ) {
			$sanitized['visibility_controls'] = $this->sanitize_recursive( $value['visibility_controls'] );
		}

		if ( array_key_exists( 'date_now_api_key', $value ) ) {
			$sanitized['date_now_api_key'] = sanitize_text_field( (string) $value['date_now_api_key'] );
			update_option( 'yokoi_date_now_api_key', $sanitized['date_now_api_key'], 'yes' );
		}

		return $sanitized;
	}

	/**
	 * Sanitize recursive arrays by stripping tags from string values.
	 *
	 * @param mixed $value Potentially nested data structure.
	 *
	 * @return array<mixed>
	 */
	public function sanitize_recursive( $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		foreach ( $value as $key => $item ) {
			if ( is_array( $item ) ) {
				$value[ $key ] = $this->sanitize_recursive( $item );
			} elseif ( is_bool( $item ) ) {
				$value[ $key ] = $item;
			} elseif ( is_numeric( $item ) ) {
				$value[ $key ] = 0 + $item;
			} else {
				$value[ $key ] = sanitize_text_field( (string) $item );
			}
		}

		return $value;
	}

	/**
	 * Validate blocks_enabled payload.
	 *
	 * @param mixed            $value   Submitted value.
	 * @param WP_REST_Request  $request Request instance.
	 * @param string           $param   Parameter name.
	 *
	 * @return true|WP_Error
	 */
	public function validate_blocks_enabled( $value, WP_REST_Request $request, string $param ) {
		unset( $request, $param );
		if ( null === $value ) {
			return true;
		}

		if ( ! is_array( $value ) ) {
			return new WP_Error( 'yokoi_invalid_blocks', __( 'The blocks_enabled parameter must be an object.', 'yokoi' ), array( 'status' => 400 ) );
		}

		foreach ( $value as $block_name => $enabled ) {
			if ( ! is_string( $block_name ) || '' === $block_name ) {
				return new WP_Error( 'yokoi_invalid_block_name', __( 'Block keys must be non-empty strings.', 'yokoi' ), array( 'status' => 400 ) );
			}

			if ( ! $this->is_valid_block_name( $block_name ) ) {
				return new WP_Error( 'yokoi_invalid_block_identifier', __( 'Block names must use the namespace/block-name format.', 'yokoi' ), array( 'status' => 400 ) );
			}

			rest_sanitize_boolean( $enabled );
		}

		return true;
	}

	/**
	 * Sanitize blocks_enabled payload into boolean map.
	 *
	 * @param mixed $value Submitted value.
	 *
	 * @return array<string,bool>
	 */
	public function sanitize_blocks_enabled( $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $value as $block_name => $enabled ) {
			if ( ! is_string( $block_name ) ) {
				continue;
			}

			$block_name = sanitize_text_field( $block_name );

			if ( ! $this->is_valid_block_name( $block_name ) ) {
				continue;
			}

			$sanitized[ $block_name ] = rest_sanitize_boolean( $enabled );
		}

		return $sanitized;
	}

	/**
	 * Determine whether the provided block name appears valid.
	 *
	 * @param string $block_name Block identifier.
	 *
	 * @return bool
	 */
	private function is_valid_block_name( string $block_name ): bool {
		return (bool) preg_match( '/^[a-z0-9-]+\/[a-z0-9-]+(?:-[a-z0-9-]+)*$/', $block_name );
	}

	/**
	 * Provide JSON schema for documentation and validation.
	 *
	 * @return array<string,mixed>
	 */
	public function get_settings_schema(): array {
		return array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'Yokoi Settings',
			'type'       => 'object',
			'additionalProperties' => false,
			'properties' => array(
				'blocks_enabled'      => array(
					'type'                 => 'object',
					'context'              => array( 'view', 'edit' ),
					'description'          => __( 'Mapping of block names to their enabled status.', 'yokoi' ),
					'additionalProperties' => array(
						'type' => 'boolean',
					),
				),
				'default_configs'     => array(
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'description' => __( 'Default attributes for blocks.', 'yokoi' ),
				),
				'visibility_controls' => array(
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'description' => __( 'Controls for block visibility based on context such as user role.', 'yokoi' ),
				),
				'date_now_api_key'    => array(
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'description' => __( 'Google Calendar API key for the Date.now block.', 'yokoi' ),
				),
			),
		);
	}
}

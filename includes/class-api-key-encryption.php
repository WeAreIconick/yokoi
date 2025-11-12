<?php
/**
 * API key encryption helper.
 *
 * @package Yokoi
 */

namespace Yokoi;

use function base64_encode;
use function base64_decode;
use function get_option;
use function update_option;
use function delete_option;
use function wp_salt;
use function hash;
use function openssl_encrypt;
use function openssl_decrypt;
use function openssl_random_pseudo_bytes;
use function substr;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles encryption/decryption of sensitive API keys.
 */
class API_Key_Encryption {
	/**
	 * Option name for storing encrypted API key.
	 */
	private const ENCRYPTED_OPTION_KEY = 'yokoi_date_now_api_key_encrypted';

	/**
	 * Legacy option name (for migration).
	 */
	private const LEGACY_OPTION_KEY = 'yokoi_date_now_api_key';

	/**
	 * Encrypt and store an API key.
	 *
	 * @param string $api_key Plain text API key.
	 * @return bool True on success, false on failure.
	 */
	public static function encrypt_and_store( string $api_key ): bool {
		if ( '' === $api_key ) {
			delete_option( self::ENCRYPTED_OPTION_KEY );
			delete_option( self::LEGACY_OPTION_KEY );
			return true;
		}

		$encrypted = self::encrypt( $api_key );
		if ( false === $encrypted ) {
			return false;
		}

		$result = update_option( self::ENCRYPTED_OPTION_KEY, $encrypted, 'no' );

		// Remove legacy plain text option if it exists.
		delete_option( self::LEGACY_OPTION_KEY );

		return $result;
	}

	/**
	 * Retrieve and decrypt an API key.
	 *
	 * @return string Decrypted API key, or empty string if not found.
	 */
	public static function retrieve_and_decrypt(): string {
		$encrypted = get_option( self::ENCRYPTED_OPTION_KEY, false );

		if ( false === $encrypted ) {
			// Try legacy option for migration.
			$legacy = get_option( self::LEGACY_OPTION_KEY, '' );
			if ( '' !== $legacy ) {
				// Migrate to encrypted storage.
				self::encrypt_and_store( $legacy );
				return $legacy;
			}
			return '';
		}

		$decrypted = self::decrypt( $encrypted );
		return false !== $decrypted ? $decrypted : '';
	}

	/**
	 * Encrypt a string using WordPress salts.
	 *
	 * @param string $plaintext Plain text to encrypt.
	 * @return string|false Base64-encoded encrypted string, or false on failure.
	 */
	private static function encrypt( string $plaintext ) {
		if ( ! function_exists( 'openssl_encrypt' ) ) {
			// Fallback: simple obfuscation if OpenSSL not available.
			return base64_encode( $plaintext . wp_salt( 'yokoi_api_key' ) );
		}

		$key  = hash( 'sha256', wp_salt( 'yokoi_api_key' ), true );
		$iv   = openssl_random_pseudo_bytes( 16 );
		$data = openssl_encrypt( $plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );

		if ( false === $data ) {
			return false;
		}

		return base64_encode( $iv . $data );
	}

	/**
	 * Decrypt a string encrypted with encrypt().
	 *
	 * @param string $encrypted Base64-encoded encrypted string.
	 * @return string|false Decrypted plain text, or false on failure.
	 */
	private static function decrypt( string $encrypted ) {
		$data = base64_decode( $encrypted, true );
		if ( false === $data ) {
			return false;
		}

		if ( ! function_exists( 'openssl_decrypt' ) ) {
			// Fallback: simple deobfuscation.
			$decoded = base64_decode( $encrypted, true );
			if ( false === $decoded ) {
				return false;
			}
			$salt = wp_salt( 'yokoi_api_key' );
			if ( substr( $decoded, -strlen( $salt ) ) === $salt ) {
				return substr( $decoded, 0, -strlen( $salt ) );
			}
			return false;
		}

		$key  = hash( 'sha256', wp_salt( 'yokoi_api_key' ), true );
		$iv   = substr( $data, 0, 16 );
		$data = substr( $data, 16 );

		return openssl_decrypt( $data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
	}
}


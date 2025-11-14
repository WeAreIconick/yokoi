<?php
/**
 * Dependency checker - validates all dependencies before use.
 *
 * @package Yokoi
 */

namespace Yokoi;

use function function_exists;
use function file_exists;
use function class_exists;
use function method_exists;
use function is_callable;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates dependencies before use to prevent fatal errors.
 */
class Dependency_Checker {
	/**
	 * Required files.
	 *
	 * @var array<string>
	 */
	private static array $required_files = array();

	/**
	 * Required functions.
	 *
	 * @var array<string>
	 */
	private static array $required_functions = array();

	/**
	 * Required classes.
	 *
	 * @var array<string>
	 */
	private static array $required_classes = array();

	/**
	 * Check if a file exists and load it if needed.
	 *
	 * @param string $file_path File path relative to plugin directory.
	 * @param bool   $auto_load Whether to automatically load the file if missing.
	 * @return bool True if file exists or was loaded.
	 */
	public static function require_file( string $file_path, bool $auto_load = true ): bool {
		$full_path = YOKOI_PLUGIN_DIR . ltrim( $file_path, '/\\' );

		if ( file_exists( $full_path ) ) {
			if ( $auto_load && ! in_array( $file_path, self::$required_files, true ) ) {
				require_once $full_path;
				self::$required_files[] = $file_path;
			}
			return true;
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( "Yokoi: Required file not found: {$file_path}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		return false;
	}

	/**
	 * Check if a function exists.
	 *
	 * @param string $function_name Function name (can include namespace).
	 * @return bool True if function exists.
	 */
	public static function function_exists( string $function_name ): bool {
		if ( function_exists( $function_name ) ) {
			return true;
		}

		// Check namespaced function.
		$namespaced = __NAMESPACE__ . '\\' . $function_name;
		if ( function_exists( $namespaced ) ) {
			return true;
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( "Yokoi: Required function not found: {$function_name}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		return false;
	}

	/**
	 * Safely call a function if it exists.
	 *
	 * @param string   $function_name Function name.
	 * @param mixed    $default_value Default value if function doesn't exist.
	 * @param mixed ...$args Function arguments.
	 * @return mixed Function result or default value.
	 */
	public static function safe_call( string $function_name, $default_value = null, ...$args ) {
		if ( ! self::function_exists( $function_name ) ) {
			return $default_value;
		}

		try {
			// Try namespaced version first.
			$namespaced = __NAMESPACE__ . '\\' . $function_name;
			if ( function_exists( $namespaced ) ) {
				return call_user_func_array( $namespaced, $args );
			}

			// Fall back to global.
			if ( function_exists( $function_name ) ) {
				return call_user_func_array( $function_name, $args );
			}
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( "Yokoi: Error calling {$function_name}: " . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return $default_value;
		}

		return $default_value;
	}

	/**
	 * Check if a class exists.
	 *
	 * @param string $class_name Class name (can include namespace).
	 * @return bool True if class exists.
	 */
	public static function class_exists( string $class_name ): bool {
		if ( class_exists( $class_name ) ) {
			return true;
		}

		// Check namespaced class.
		$namespaced = __NAMESPACE__ . '\\' . $class_name;
		if ( class_exists( $namespaced ) ) {
			return true;
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( "Yokoi: Required class not found: {$class_name}" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		return false;
	}

	/**
	 * Validate all dependencies for a class.
	 *
	 * @param array<string> $files Required files.
	 * @param array<string> $functions Required functions.
	 * @param array<string> $classes Required classes.
	 * @return bool True if all dependencies are met.
	 */
	public static function validate_dependencies( array $files = array(), array $functions = array(), array $classes = array() ): bool {
		$all_valid = true;

		// Check files.
		foreach ( $files as $file ) {
			if ( ! self::require_file( $file ) ) {
				$all_valid = false;
			}
		}

		// Check functions.
		foreach ( $functions as $function ) {
			if ( ! self::function_exists( $function ) ) {
				$all_valid = false;
			}
		}

		// Check classes.
		foreach ( $classes as $class ) {
			if ( ! self::class_exists( $class ) ) {
				$all_valid = false;
			}
		}

		return $all_valid;
	}

	/**
	 * Get missing dependencies.
	 *
	 * @param array<string> $files Required files.
	 * @param array<string> $functions Required functions.
	 * @param array<string> $classes Required classes.
	 * @return array<string> List of missing dependencies.
	 */
	public static function get_missing_dependencies( array $files = array(), array $functions = array(), array $classes = array() ): array {
		$missing = array();

		foreach ( $files as $file ) {
			$full_path = YOKOI_PLUGIN_DIR . ltrim( $file, '/\\' );
			if ( ! file_exists( $full_path ) ) {
				$missing[] = "File: {$file}";
			}
		}

		foreach ( $functions as $function ) {
			if ( ! self::function_exists( $function ) ) {
				$missing[] = "Function: {$function}";
			}
		}

		foreach ( $classes as $class ) {
			if ( ! self::class_exists( $class ) ) {
				$missing[] = "Class: {$class}";
			}
		}

		return $missing;
	}
}


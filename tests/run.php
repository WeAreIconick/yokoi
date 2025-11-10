<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/**
 * Simple assertion helper.
 *
 * @param bool   $condition Condition to evaluate.
 * @param string $message   Failure message.
 *
 * @return void
 */
function yokoi_assert( bool $condition, string $message ): void {
	if ( ! $condition ) {
		throw new RuntimeException( $message );
	}
}

/**
 * Utility for creating and cleaning up block fixtures.
 */
final class Yokoi_Block_Test_Environment {
	private const BUILD_BLOCK = 'yokoi/phpunit-build';
	private const SRC_ONLY_BLOCK = 'yokoi/phpunit-src-only';

	private static array $createdDirectories = array();
	private static bool $initialized = false;

	public static function setup(): void {
		if ( self::$initialized ) {
			return;
		}

		self::$initialized = true;

		$buildBase      = YOKOI_PLUGIN_DIR . 'build/blocks';
		$buildBlockDir  = $buildBase . '/phpunit-build';
		$srcBuildDir    = YOKOI_PLUGIN_DIR . 'src/blocks/phpunit-build';
		$srcOnlyDir     = YOKOI_PLUGIN_DIR . 'src/blocks/phpunit-src-only';

		self::ensureDirectory( $buildBase );
		self::ensureDirectory( $buildBlockDir );
		self::ensureDirectory( $srcBuildDir );
		self::ensureDirectory( $srcOnlyDir );

		self::writeBlockJson(
			$srcBuildDir,
			array(
				'name'        => self::BUILD_BLOCK,
				'title'       => 'PHPUnit Build Block (Source)',
				'description' => 'Source variant should be ignored when build exists.',
			)
		);

		self::writeBlockJson(
			$buildBlockDir,
			array(
				'name'        => self::BUILD_BLOCK,
				'title'       => 'PHPUnit Build Block',
				'description' => 'Build variant should take precedence.',
			)
		);

		self::writeBlockJson(
			$srcOnlyDir,
			array(
				'name'        => self::SRC_ONLY_BLOCK,
				'title'       => 'PHPUnit Source Only Block',
				'description' => 'Only available in src; useful for defaults.',
			)
		);

		self::$createdDirectories = array(
			$buildBlockDir,
			$srcBuildDir,
			$srcOnlyDir,
		);
	}

	public static function teardown(): void {
		foreach ( self::$createdDirectories as $dir ) {
			self::deleteDirectory( $dir );
		}
		self::$createdDirectories = array();
		self::$initialized        = false;
	}

	private static function ensureDirectory( string $dir ): void {
		if ( ! is_dir( $dir ) ) {
			mkdir( $dir, 0777, true );
		}
	}

	private static function writeBlockJson( string $dir, array $data ): void {
		self::ensureDirectory( $dir );
		$payload = json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		file_put_contents( $dir . '/block.json', $payload );
	}

	private static function deleteDirectory( string $path ): void {
		if ( ! is_dir( $path ) ) {
			return;
		}

		$items = array_diff( scandir( $path ), array( '.', '..' ) );
		foreach ( $items as $item ) {
			$target = $path . DIRECTORY_SEPARATOR . $item;
			if ( is_dir( $target ) ) {
				self::deleteDirectory( $target );
			} else {
				unlink( $target );
			}
		}

		rmdir( $path );
	}
}

use function Yokoi\get_all_blocks_metadata;
use function Yokoi\get_block_catalog_entries;
use function Yokoi\get_block_definitions_map;
use function Yokoi\get_block_default_states;

try {
	Yokoi_Block_Test_Environment::setup();

	$metadata = get_all_blocks_metadata();
	yokoi_assert(
		isset( $metadata['yokoi/phpunit-build'] ),
		'Expected build block metadata to be discovered.'
	);
	yokoi_assert(
		'build' === ( $metadata['yokoi/phpunit-build']['source'] ?? null ),
		'Build block should prefer build metadata over src.'
	);
	yokoi_assert(
		isset( $metadata['yokoi/phpunit-src-only'] ),
		'Expected src-only block metadata to be discovered.'
	);

	$definitions = get_block_definitions_map();
	yokoi_assert(
		isset( $definitions['yokoi/phpunit-build']['path'] ),
		'Build block should appear in definitions map.'
	);
	yokoi_assert(
		! isset( $definitions['yokoi/phpunit-src-only'] ),
		'Src-only block should not appear in definitions map (missing build assets).'
	);

	$catalog = get_block_catalog_entries();
	$catalogNames = array_column( $catalog, 'name' );
	yokoi_assert(
		in_array( 'yokoi/phpunit-build', $catalogNames, true ),
		'Catalog should include build block.'
	);
	yokoi_assert(
		in_array( 'yokoi/phpunit-src-only', $catalogNames, true ),
		'Catalog should include src-only block.'
	);

	$defaults = get_block_default_states();
	yokoi_assert(
		isset( $defaults['yokoi/phpunit-build'] ) && true === $defaults['yokoi/phpunit-build'],
		'Default states should enable build block.'
	);
	yokoi_assert(
		isset( $defaults['yokoi/phpunit-src-only'] ) && true === $defaults['yokoi/phpunit-src-only'],
		'Default states should enable src-only block.'
	);

	yokoi_assert(
		class_exists( '\\Yokoi\\Date_Now\\Service' ),
		'Expected Yokoi\\Date_Now\\Service to be autoloadable.'
	);

	Yokoi_Block_Test_Environment::teardown();
	echo "All tests passed.\n";
	exit( 0 );
} catch ( Throwable $throwable ) {
	Yokoi_Block_Test_Environment::teardown();
	fwrite( STDERR, 'Tests failed: ' . $throwable->getMessage() . PHP_EOL );
	exit( 1 );
}


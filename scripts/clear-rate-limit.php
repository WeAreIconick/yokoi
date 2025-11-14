#!/usr/bin/env php
<?php
/**
 * Clear Yokoi Rate Limit Cache
 * 
 * This script clears all rate limit transients for Yokoi.
 * Run this if you're hitting rate limit errors during development.
 */

// Load WordPress
require_once __DIR__ . '/../wp-load.php';

if ( ! defined( 'ABSPATH' ) ) {
	die( 'WordPress not loaded' );
}

global $wpdb;

// Delete all Yokoi rate limit transients
$deleted = $wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_yokoi_rate_limit_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_yokoi_rate_limit_' ) . '%'
	)
);

echo "Cleared {$deleted} rate limit transients.\n";


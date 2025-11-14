# Error Prevention System

This document outlines the comprehensive error prevention system implemented in Yokoi to prevent fatal errors.

## Overview

Yokoi includes a multi-layered error prevention system that ensures the plugin never causes fatal errors, even if dependencies are missing or code fails.

## Core Components

### 1. Dependency Checker (`class-dependency-checker.php`)

The `Dependency_Checker` class provides:

- **File validation** - Checks if files exist before requiring them
- **Function validation** - Validates functions exist before calling
- **Class validation** - Validates classes exist before instantiating
- **Safe function calls** - Wraps function calls in try-catch with fallbacks
- **Dependency validation** - Validates all dependencies at once

**Usage:**

```php
// Check if file exists and load it
if ( Dependency_Checker::require_file( 'includes/block-utils.php' ) ) {
	// File loaded successfully
}

// Check if function exists
if ( Dependency_Checker::function_exists( 'get_block_definitions_map' ) ) {
	// Function is available
}

// Safely call a function with fallback
$result = Dependency_Checker::safe_call( 'get_block_definitions_map', array() );

// Validate all dependencies
if ( Dependency_Checker::validate_dependencies(
	array( 'includes/block-utils.php' ),
	array( 'get_block_definitions_map' ),
	array( 'Block_Registry' )
) ) {
	// All dependencies available
}
```

### 2. Error Handling in Plugin Class

The main `Plugin` class now:

- **Validates all dependencies** before loading
- **Wraps all initialization** in try-catch blocks
- **Wraps all hook registration** in try-catch blocks
- **Gracefully degrades** if services fail to initialize
- **Logs errors** only in debug mode

**Key Features:**

```php
// All service initialization is wrapped
try {
	if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\Settings_API' ) ) {
		$this->settings_api = new Settings_API();
	}
} catch ( \Throwable $e ) {
	// Logs error but doesn't crash
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( 'Yokoi: Failed to initialize Settings_API: ' . $e->getMessage() );
	}
}
```

### 3. Safe Function Calls

All critical function calls use `Dependency_Checker::safe_call()`:

```php
// Instead of:
$blocks = get_block_definitions_map();

// Use:
$blocks = Dependency_Checker::safe_call( 'get_block_definitions_map', array() );
```

### 4. Validation Before Use

All classes validate dependencies before using them:

```php
public function validate_block_registrations(): void {
	// Validate dependencies before proceeding
	if ( ! Dependency_Checker::validate_dependencies(
		array( 'includes/block-utils.php' ),
		array( 'get_block_definitions_map' )
	) ) {
		// Silently fail if dependencies aren't available
		return;
	}
	
	// Safe to proceed
	$blocks = Dependency_Checker::safe_call( 'get_block_definitions_map', array() );
}
```

## Error Prevention Layers

### Layer 1: File Loading
- Files are checked for existence before requiring
- Missing files are logged but don't cause fatal errors
- Failed loads are skipped gracefully

### Layer 2: Class Instantiation
- Classes are validated before instantiation
- Failed instantiations are caught and logged
- Plugin continues with available services

### Layer 3: Function Calls
- Functions are validated before calling
- Safe calls return fallback values on failure
- Errors are caught and handled gracefully

### Layer 4: Hook Registration
- All hooks are registered with error handling
- Failed hook registrations don't crash the plugin
- Errors are logged in debug mode only

### Layer 5: Runtime Operations
- All runtime operations use try-catch
- Errors are isolated to prevent propagation
- Plugin degrades gracefully

## Best Practices

### 1. Always Use Dependency_Checker

```php
// ✅ Good
if ( Dependency_Checker::function_exists( 'my_function' ) ) {
	$result = Dependency_Checker::safe_call( 'my_function', array( $arg ) );
}

// ❌ Bad
$result = my_function( $arg ); // May cause fatal error
```

### 2. Validate Before Instantiation

```php
// ✅ Good
if ( Dependency_Checker::class_exists( __NAMESPACE__ . '\\My_Class' ) ) {
	$instance = new My_Class();
}

// ❌ Bad
$instance = new My_Class(); // May cause fatal error
```

### 3. Wrap Critical Operations

```php
// ✅ Good
try {
	// Critical operation
} catch ( \Throwable $e ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( 'Error: ' . $e->getMessage() );
	}
	// Fallback behavior
}

// ❌ Bad
// Critical operation - may throw uncaught exception
```

### 4. Check Function Existence

```php
// ✅ Good
if ( is_callable( 'apply_filters' ) ) {
	return apply_filters( 'my_filter', $value );
}

// ❌ Bad
return apply_filters( 'my_filter', $value ); // May fail
```

## Error Logging

Errors are logged only when `WP_DEBUG` is enabled:

```php
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
	error_log( 'Yokoi: Error message here' );
}
```

This ensures:
- Production sites don't fill error logs
- Development sites get detailed error information
- Errors are visible when debugging

## Graceful Degradation

The system is designed to degrade gracefully:

1. **Missing Files** - Skipped, plugin continues
2. **Missing Classes** - Skipped, other services continue
3. **Missing Functions** - Fallback values returned
4. **Failed Initialization** - Service disabled, others continue
5. **Failed Hooks** - Hook skipped, others continue

## Testing Error Prevention

To test error prevention:

1. **Rename a required file** - Plugin should continue working
2. **Comment out a function** - Plugin should use fallbacks
3. **Remove a class** - Plugin should skip that service
4. **Cause an exception** - Plugin should catch and log it

## Summary

The error prevention system ensures:

- ✅ **No fatal errors** - All errors are caught and handled
- ✅ **Graceful degradation** - Plugin works even if parts fail
- ✅ **Debug logging** - Errors logged only in debug mode
- ✅ **Dependency validation** - All dependencies checked before use
- ✅ **Safe function calls** - All calls wrapped with error handling
- ✅ **Isolated failures** - One failure doesn't break everything

This creates a rock-solid foundation where the plugin will never cause a fatal error, even in edge cases or when dependencies are missing.


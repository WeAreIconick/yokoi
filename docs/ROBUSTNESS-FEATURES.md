# Robustness Features

This document outlines the additional robustness features implemented to ensure blocks don't interfere with each other.

## Overview

Beyond basic isolation, Yokoi includes several advanced features to ensure rock-solid block separation:

1. **Error Boundaries** - JavaScript errors in one block don't crash others
2. **Performance Monitoring** - Track and identify performance bottlenecks
3. **Z-Index Management** - Prevent z-index conflicts automatically
4. **Memory Leak Detection** - Monitor and prevent memory leaks
5. **Runtime Conflict Detection** - Detect conflicts as they happen
6. **Graceful Degradation** - Blocks fail gracefully without breaking the page

## Error Boundaries

### JavaScript Error Isolation

All block JavaScript is wrapped in error boundaries that:
- Catch and isolate errors within a block
- Log errors with block context
- Dispatch error events for monitoring
- Prevent errors from propagating to other blocks

**Usage:**

```javascript
import { isolatedBlockInit } from '../utils/block-isolation';

isolatedBlockInit( 'yokoi/navygator', ( isolated ) => {
	// If this throws an error, it won't affect other blocks
	const wrapper = isolated.querySelector( '.navygator-toc-wrapper' );
	// ... rest of initialization
} );
```

### Error Handling Utilities

Additional utilities for fine-grained error handling:

```javascript
import { withErrorBoundary, safeEventListener } from '../utils/error-boundary';

// Wrap any function
const safeFunction = withErrorBoundary( myFunction, 'yokoi/navygator' );

// Wrap event listeners
element.addEventListener( 'click', safeEventListener( handler, 'yokoi/navygator' ) );
```

## Performance Monitoring

### Automatic Performance Tracking

The system automatically tracks:
- Block initialization time
- Render performance
- Memory usage
- Long-running operations

**Usage:**

```javascript
import { markPerformance, measurePerformance, monitorExecution } from '../utils/performance-monitor';

// Mark performance points
markPerformance( 'yokoi/navygator', 'init-start' );
// ... initialization code ...
markPerformance( 'yokoi/navygator', 'init-end' );

// Measure between markers
const duration = measurePerformance( 'yokoi/navygator', 'init', 'init-start', 'init-end' );

// Monitor function execution
const monitoredFn = monitorExecution( myFunction, 'yokoi/navygator', 'operation' );
```

### Performance Warnings

Operations taking longer than 100ms automatically log warnings:

```
[Yokoi Performance] yokoi/navygator/init took 150.23ms
```

## Z-Index Management

### Automatic Z-Index Assignment

Each block gets a unique z-index range to prevent conflicts:

```php
$z_index_manager = new Z_Index_Manager();
$z_index = $z_index_manager->get_z_index( 0, 'yokoi/navygator' );
// Returns: 1000 (base), 1001 (overlay), 1002 (modal)
```

**CSS Usage:**

```scss
.navygator-toc {
	z-index: var(--navygator-z-index-base, 1000);
}

.navygator-toc-overlay {
	z-index: var(--navygator-z-index-overlay, 1001);
}
```

### Z-Index Ranges

Each block gets:
- **Base**: Base z-index (1000 + block_index * 10)
- **Overlay**: Base + 1
- **Modal**: Base + 2

This ensures blocks never overlap incorrectly.

## Memory Leak Detection

### Memory Tracking

Track memory usage per block:

```javascript
import { trackMemory } from '../utils/performance-monitor';

const memory = trackMemory( 'yokoi/navygator' );
// Returns: { block, used, total, limit, timestamp }
```

### Cleanup Utilities

The isolation system provides cleanup functions:

```javascript
const cleanup = isolated.addEventListener( element, 'click', handler );

// Later, when block is removed:
cleanup();
```

## Runtime Conflict Detection

### Real-Time Monitoring

The `Block_Monitor` class tracks:
- JavaScript errors per block
- Performance metrics per block
- Memory usage trends
- Conflict warnings

**Access Metrics:**

```php
$monitor = new Block_Monitor();
$metrics = $monitor->get_metrics( 'yokoi/navygator' );
$errors = $monitor->get_errors( 'yokoi/navygator' );
```

### Error Logging

Errors are automatically logged to the database (when `WP_DEBUG` is enabled):

```php
// Get recent errors
$errors = $monitor->get_errors();
// Returns: Array of error entries with block, message, timestamp
```

## Graceful Degradation

### Fail-Safe Initialization

Blocks are designed to fail gracefully:

1. **Missing Dependencies**: Blocks check for required dependencies before initializing
2. **DOM Not Ready**: Blocks wait for DOM to be ready
3. **API Failures**: Blocks handle API failures without breaking
4. **Invalid Data**: Blocks validate data before processing

**Example:**

```javascript
isolatedBlockInit( 'yokoi/navygator', ( isolated ) => {
	const wrapper = isolated.querySelector( '.navygator-toc-wrapper' );
	
	// Graceful exit if element not found
	if ( ! wrapper ) {
		isolated.warn( 'TOC wrapper not found, skipping initialization' );
		return;
	}
	
	// Continue with initialization...
} );
```

## Best Practices

### 1. Always Use Error Boundaries

```javascript
// ✅ Good
isolatedBlockInit( 'yokoi/navygator', ( isolated ) => {
	// Code here is protected
} );

// ❌ Bad
( function() {
	// No error protection
	init();
} )();
```

### 2. Clean Up Event Listeners

```javascript
// ✅ Good
const cleanup = isolated.addEventListener( element, 'click', handler );
// Later: cleanup();

// ❌ Bad
element.addEventListener( 'click', handler );
// Never cleaned up
```

### 3. Use Performance Monitoring

```javascript
// ✅ Good
const monitoredFn = monitorExecution( myFunction, 'yokoi/navygator', 'operation' );

// ❌ Bad
myFunction(); // No monitoring
```

### 4. Check for Elements Before Use

```javascript
// ✅ Good
const element = isolated.querySelector( '.my-element' );
if ( ! element ) {
	return;
}

// ❌ Bad
const element = isolated.querySelector( '.my-element' );
element.addEventListener( 'click', handler ); // May fail
```

### 5. Use Z-Index Manager

```php
// ✅ Good
$z_index = $z_index_manager->get_z_index( 0, 'yokoi/navygator' );

// ❌ Bad
z-index: 9999; // May conflict
```

## Monitoring Dashboard

When `WP_DEBUG` is enabled, monitoring scripts are automatically injected:

- **Error Tracking**: All block errors are logged
- **Performance Metrics**: Block performance is tracked
- **Memory Usage**: Memory consumption is monitored
- **Conflict Detection**: Conflicts are detected and logged

Access metrics via:

```php
$monitor = new Block_Monitor();
$metrics = $monitor->get_metrics();
$errors = $monitor->get_errors();
```

## Summary

These robustness features ensure:

1. **Errors don't propagate** - One block's errors don't affect others
2. **Performance is monitored** - Slow blocks are identified
3. **Z-index conflicts are prevented** - Automatic z-index management
4. **Memory leaks are detected** - Memory usage is tracked
5. **Conflicts are detected** - Runtime conflict detection
6. **Graceful degradation** - Blocks fail safely

Together with the isolation system, these features provide a rock-solid foundation for block development.


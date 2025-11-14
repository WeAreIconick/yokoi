# Block Isolation Standards

This document outlines the standards and practices for ensuring blocks don't interfere with each other in the Yokoi plugin.

## Overview

Each block in Yokoi must be completely isolated from other blocks to prevent:
- CSS class conflicts
- JavaScript variable/function conflicts
- PHP namespace conflicts
- Asset handle conflicts
- Hook/filter conflicts

## Naming Conventions

### Block Names
- **Format**: `yokoi/{block-slug}`
- **Example**: `yokoi/navygator`, `yokoi/date-now`
- **Rules**:
  - Must start with `yokoi/`
  - Use lowercase letters, numbers, and hyphens only
  - No underscores or special characters

### CSS Classes
- **Format**: `{block-slug}-{element-name}`
- **Example**: `navygator-toc-wrapper`, `date-now-calendar`
- **Rules**:
  - Always prefix with block slug
  - Use hyphens to separate words
  - Never use generic names like `container`, `wrapper`, `button` without prefix

### JavaScript Namespaces
- **Format**: `Yokoi{BlockName}` (PascalCase)
- **Example**: `YokoiNavygator`, `YokoiDateNow`
- **Rules**:
  - Use PascalCase
  - Prefix with `Yokoi`
  - Convert hyphens to camelCase (e.g., `navygator` → `Navygator`)

### Asset Handles
- **Format**: `yokoi-{block-slug}-{type}`
- **Example**: `yokoi-navygator-view`, `yokoi-date-now-style`
- **Types**: `view`, `style`, `editor`, `script`
- **Rules**:
  - Always prefix with `yokoi-`
  - Include block slug
  - Specify asset type

### PHP Namespaces
- **Format**: `Yokoi\{BlockName}`
- **Example**: `Yokoi\Navygator`, `Yokoi\Date_Now`
- **Rules**:
  - Use PascalCase
  - Convert hyphens to underscores for class names
  - Each block should have its own namespace directory

## JavaScript Isolation

### Use IIFE Pattern
Always wrap block JavaScript in an Immediately Invoked Function Expression (IIFE):

```javascript
( function() {
	'use strict';
	// Block code here
} )();
```

### Use Isolation Utilities
Use the provided isolation utilities from `src/utils/block-isolation.js`:

```javascript
import { isolatedBlockInit, createBlockNamespace } from '../utils/block-isolation';

isolatedBlockInit( 'yokoi/navygator', ( isolated ) => {
	// Use isolated.querySelector, isolated.addEventListener, etc.
	const wrapper = isolated.querySelector( '.navygator-toc-wrapper' );
} );
```

### Prevent Duplicate Initialization
Always check for existing initialization:

```javascript
if ( window.navygatorInitialized ) {
	return;
}
window.navygatorInitialized = true;
```

### Scoped Selectors
Always scope selectors to block-specific classes:

```javascript
// ✅ Good
const wrapper = document.querySelector( '.navygator-toc-wrapper' );

// ❌ Bad
const wrapper = document.querySelector( '.wrapper' );
```

### Event Listeners
Use scoped event listeners and clean them up:

```javascript
const cleanup = isolated.addEventListener( document, 'click', handler );
// Later: cleanup();
```

## CSS Isolation

### Prefix All Classes
Every CSS class must be prefixed with the block slug:

```scss
// ✅ Good
.navygator-toc-wrapper { }
.navygator-toc-title { }

// ❌ Bad
.wrapper { }
.title { }
```

### Use Block Wrapper
Always wrap block content in a block-specific wrapper:

```html
<div class="navygator-toc-wrapper">
	<!-- Block content -->
</div>
```

### Avoid Global Styles
Never use global selectors without block prefix:

```scss
// ❌ Bad
button { }
a { }

// ✅ Good
.navygator-toc-button { }
.navygator-toc-link { }
```

## PHP Isolation

### Namespace Everything
Every PHP file must use a proper namespace:

```php
namespace Yokoi\Navygator;
```

### Use Service Classes
Each block should have a `Service` class in its namespace:

```php
namespace Yokoi\Navygator;

class Service {
	public function register(): void {
		// Register hooks
	}
}
```

### Unique Hook Priorities
Use unique hook priorities to prevent conflicts:

```php
add_filter( 'the_content', array( $this, 'add_heading_ids' ), 10 );
```

Use the isolation system to get recommended priorities:

```php
$isolation = new Block_Isolation();
$priority = $isolation->get_hook_priority( 'the_content', 'yokoi/navygator' );
```

### Scoped Filter Checks
Always check if your block is present before applying filters:

```php
public function add_heading_ids( string $content ): string {
	if ( ! has_block( 'yokoi/navygator' ) ) {
		return $content;
	}
	// Process content
}
```

## Asset Isolation

### Unique Handles
Use the isolation system to generate unique asset handles:

```php
$isolation = new Block_Isolation();
$handle = $isolation->get_asset_handle( 'yokoi/navygator', 'view' );
wp_enqueue_script( $handle, ... );
```

### Conditional Loading
Only load assets when block is present:

```php
public function enqueue_frontend(): void {
	if ( ! has_block( 'yokoi/navygator' ) ) {
		return;
	}
	// Enqueue assets
}
```

## Block Registration

### Check Before Registering
Always check if block is already registered:

```php
$registry = WP_Block_Type_Registry::get_instance();
if ( $registry->is_registered( 'yokoi/navygator' ) ) {
	return;
}
```

### Use Render Callbacks
For dynamic blocks, use render callbacks:

```php
register_block_type(
	$block_dir,
	array(
		'render_callback' => array( Block_Renderer::class, 'render' ),
	)
);
```

## Testing Isolation

### Checklist
Before submitting a block, verify:

- [ ] Block name follows `yokoi/{block-slug}` format
- [ ] All CSS classes are prefixed with block slug
- [ ] JavaScript uses IIFE and isolation utilities
- [ ] PHP uses proper namespace
- [ ] Asset handles are unique and follow convention
- [ ] Hook priorities are unique
- [ ] No global variables or functions (except initialization flags)
- [ ] All selectors are scoped to block classes
- [ ] Assets only load when block is present

### Conflict Detection
The `Block_Isolation` class automatically detects conflicts:

```php
$isolation = new Block_Isolation();
// Automatically validates on init hook
```

## Examples

### Good Block Structure

```
src/blocks/navygator/
├── block.json          # Block metadata
├── index.js            # Block registration
├── edit.js             # Editor component
├── save.js             # Save component
├── view.js             # Frontend JavaScript (isolated)
├── style.scss          # Frontend styles (prefixed)
├── editor.scss         # Editor styles (prefixed)
└── render.php          # Server-side render

includes/Navygator/
├── Service.php         # Block service (namespaced)
└── Block_Renderer.php  # Render callback (namespaced)
```

### Example: Isolated JavaScript

```javascript
import { isolatedBlockInit } from '../utils/block-isolation';

isolatedBlockInit( 'yokoi/navygator', ( isolated ) => {
	const wrapper = isolated.querySelector( '.navygator-toc-wrapper' );
	
	if ( ! wrapper ) {
		return;
	}

	const cleanup = isolated.addEventListener( wrapper, 'click', ( e ) => {
		isolated.log( 'TOC clicked', e.target );
	} );

	// Cleanup on page unload
	window.addEventListener( 'beforeunload', cleanup );
} );
```

### Example: Isolated CSS

```scss
// All classes prefixed with block slug
.navygator-toc-wrapper {
	position: relative;
}

.navygator-toc-title {
	font-size: 18px;
}

.navygator-toc-link {
	color: #333;
}
```

### Example: Isolated PHP

```php
namespace Yokoi\Navygator;

class Service {
	public function register(): void {
		add_action( 'init', array( $this, 'on_init' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend' ) );
		add_filter( 'the_content', array( $this, 'add_heading_ids' ), 10 );
	}

	public function enqueue_frontend(): void {
		if ( ! has_block( 'yokoi/navygator' ) ) {
			return;
		}
		// Enqueue assets
	}
}
```

## Enforcement

The `Block_Isolation` class automatically:
- Validates block names on registration
- Checks for duplicate namespaces
- Validates asset handles
- Validates CSS prefixes
- Validates JavaScript namespaces
- Validates hook priorities

All validation errors are logged in debug mode.


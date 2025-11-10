=== Yokoi ===
Contributors: iconick
Tags: blocks, editor, gutenberg
Requires at least: 6.2
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Modular Gutenberg blocks with site-wide settings managed directly in the Site Editor.

== Description ==

Yokoi is a modular block suite focused on performance and scalability. Enable or disable individual blocks from a dedicated sidebar in the Site Editor, lazily load block metadata over REST, and ship per-block assets so your frontend stays lean.

= Highlights =

* Toggle blocks on or off site-wide using the Yokoi sidebar in the Site Editor.
* Per-block asset loading keeps frontend payloads minimal.
* REST-powered settings storage with validation and sanitization.
* Designed to scale to hundreds of blocks with manifest-driven discovery and caching.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/yokoi`, or install directly from the Plugins screen.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Open the Site Editor and look for **Yokoi Settings** in the right-hand sidebar to toggle blocks on or off.

== Frequently Asked Questions ==

= Where do I manage the blocks? =
Inside the Site Editor, open the **Yokoi Settings** sidebar to enable or disable blocks globally.

= Does Yokoi work in the classic editor? =
No. Yokoi is designed for the block editor and Site Editor experience introduced in WordPress 5.9+.

== Screenshots ==

1. Toggle blocks from the Yokoi sidebar in the Site Editor.
2. Cozy Mode block rendering on the frontend.

== Changelog ==

= 0.1.0 =
* Initial release.

== Upgrade Notice ==

= 0.1.0 =
Initial release of Yokoi. Activate the plugin and manage blocks via the Site Editor sidebar.


<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Dynamic render implementation for NavyGator table of contents block.
 *
 * @package Yokoi
 */

namespace Yokoi\Navygator;

use function esc_attr;
use function esc_html;
use function esc_html__;
use function esc_attr__;
use function wp_kses_post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Outputs markup for the table of contents block.
 */
class Block_Renderer {
	/**
	 * Render callback entry.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content (unused).
	 * @param mixed  $block      Block instance (unused).
	 * @return string
	 */
	public static function render( array $attributes, string $content, $block ): string {
		global $post;

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'Yokoi: Navygator render callback called' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		if ( ! $post ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Navygator render - no post object' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return '<div class="navygator-toc-empty">' . esc_html__( 'No content available.', 'yokoi' ) . '</div>';
		}

		$heading_levels = isset( $attributes['headingLevels'] ) ? $attributes['headingLevels'] : array( 2, 3, 4 );
		$show_numbers   = isset( $attributes['showNumbers'] ) ? $attributes['showNumbers'] : true;
		$title          = isset( $attributes['title'] ) ? $attributes['title'] : __( 'Table of Contents', 'yokoi' );
		$background_color = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '';
		$text_color     = isset( $attributes['textColor'] ) ? $attributes['textColor'] : '';

		$headings = self::extract_headings( $post->post_content, $heading_levels );

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( sprintf( 'Yokoi: Navygator render - Post ID: %d, Headings found: %d', $post->ID ?? 0, count( $headings ) ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		if ( empty( $headings ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( 'Yokoi: Navygator render - no headings found, returning empty message' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return '<div class="navygator-toc-empty">' . esc_html__( 'No headings found in this content.', 'yokoi' ) . '</div>';
		}

		$inline_styles = array();
		if ( $background_color ) {
			$inline_styles[] = 'background-color: ' . esc_attr( $background_color );
		}
		if ( $text_color ) {
			$inline_styles[] = 'color: ' . esc_attr( $text_color );
		}
		$style_attr = ! empty( $inline_styles ) ? ' style="' . implode( '; ', $inline_styles ) . '"' : '';

		$list_type = $show_numbers ? 'ol' : 'ul';
		$toc_html  = '<div class="navygator-toc-wrapper">';

		$toc_html .= '<button class="navygator-toc-toggle" aria-label="' . esc_attr__( 'Toggle Table of Contents', 'yokoi' ) . '">';
		$toc_html .= '<span class="navygator-toc-toggle-text">Contents</span>';
		$toc_html .= '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="navygator-toc-toggle-icon">';
		// List icon (three horizontal lines) - more appropriate for TOC
		$toc_html .= '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
		$toc_html .= '</svg>';
		$toc_html .= '</button>';

		$toc_html .= '<nav class="navygator-toc"' . $style_attr . ' aria-label="' . esc_attr__( 'Table of Contents', 'yokoi' ) . '">';

		$toc_html .= '<button class="navygator-toc-close" aria-label="' . esc_attr__( 'Close Table of Contents', 'yokoi' ) . '">';
		$toc_html .= '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">';
		$toc_html .= '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
		$toc_html .= '</svg>';
		$toc_html .= '</button>';

		if ( $title ) {
			$toc_html .= '<div class="navygator-toc-title">' . esc_html( $title ) . '</div>';
		}

		$toc_html .= self::build_toc_list( $headings, $list_type );
		$toc_html .= '</nav>';
		$toc_html .= '<div class="navygator-toc-backdrop"></div>';
		$toc_html .= '</div>';

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( sprintf( 'Yokoi: Navygator render - returning HTML (length: %d chars)', strlen( $toc_html ) ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		return $toc_html;
	}

	/**
	 * Extract headings from content.
	 *
	 * @param string $content       Post content (can be block markup or HTML).
	 * @param array  $heading_levels Heading levels to include.
	 * @return array
	 */
	private static function extract_headings( string $content, array $heading_levels ): array {
		$headings = array();

		// First, try to extract from block markup if content contains blocks
		if ( function_exists( 'parse_blocks' ) && has_blocks( $content ) ) {
			$blocks = parse_blocks( $content );
			$headings = array_merge( $headings, self::extract_headings_from_blocks( $blocks, $heading_levels ) );
		}

		// Also try to extract from HTML (for rendered content or HTML posts)
		if ( ! empty( $content ) ) {
			$dom = new \DOMDocument();
			libxml_use_internal_errors( true );
			$dom->loadHTML( '<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			libxml_clear_errors();

			$heading_tags = array();
			foreach ( $heading_levels as $level ) {
				$heading_tags[] = 'h' . $level;
			}

			foreach ( $heading_tags as $tag ) {
				$elements = $dom->getElementsByTagName( $tag );

				foreach ( $elements as $element ) {
					$text = trim( $element->textContent );

					if ( empty( $text ) ) {
						continue;
					}

					$id = $element->getAttribute( 'id' );
					if ( empty( $id ) ) {
						$id = self::generate_heading_id( $text );
					}

					$level = (int) substr( $tag, 1 );

					// Check if we already have this heading (avoid duplicates)
					$exists = false;
					foreach ( $headings as $existing ) {
						if ( $existing['text'] === $text && $existing['level'] === $level ) {
							$exists = true;
							break;
						}
					}

					if ( ! $exists ) {
						$headings[] = array(
							'level' => $level,
							'text'  => $text,
							'id'    => $id,
						);
					}
				}
			}
		}

		return $headings;
	}

	/**
	 * Extract headings from parsed blocks.
	 *
	 * @param array $blocks        Parsed blocks.
	 * @param array $heading_levels Heading levels to include.
	 * @return array
	 */
	private static function extract_headings_from_blocks( array $blocks, array $heading_levels ): array {
		$headings = array();

		foreach ( $blocks as $block ) {
			// Check if this is a heading block
			if ( isset( $block['blockName'] ) && 'core/heading' === $block['blockName'] ) {
				$level = isset( $block['attrs']['level'] ) ? (int) $block['attrs']['level'] : 2;
				
				if ( in_array( $level, $heading_levels, true ) ) {
					$text = '';
					if ( isset( $block['innerHTML'] ) ) {
						// Extract text from innerHTML
						$text = wp_strip_all_tags( $block['innerHTML'] );
					} elseif ( isset( $block['innerContent'][0] ) ) {
						$text = wp_strip_all_tags( $block['innerContent'][0] );
					}

					$text = trim( $text );
					if ( ! empty( $text ) ) {
						$id = self::generate_heading_id( $text );
						
						$headings[] = array(
							'level' => $level,
							'text'  => $text,
							'id'    => $id,
						);
					}
				}
			}

			// Recursively check inner blocks
			if ( ! empty( $block['innerBlocks'] ) ) {
				$headings = array_merge( $headings, self::extract_headings_from_blocks( $block['innerBlocks'], $heading_levels ) );
			}
		}

		return $headings;
	}

	/**
	 * Generate heading ID from text.
	 *
	 * @param string $text Heading text.
	 * @return string
	 */
	private static function generate_heading_id( string $text ): string {
		$id = strtolower( $text );
		$id = preg_replace( '/[^a-z0-9\s-]/', '', $id );
		$id = preg_replace( '/\s+/', '-', $id );
		$id = preg_replace( '/-+/', '-', $id );
		$id = trim( $id, '-' );

		if ( empty( $id ) ) {
			$id = 'heading-' . wp_rand( 1000, 9999 );
		}

		return $id;
	}

	/**
	 * Build TOC list HTML.
	 *
	 * @param array  $headings  Headings array.
	 * @param string $list_type List type (ol or ul).
	 * @return string
	 */
	private static function build_toc_list( array $headings, string $list_type = 'ol' ): string {
		if ( empty( $headings ) ) {
			return '';
		}

		$html = '<' . $list_type . ' class="navygator-toc-list">';

		$min_level     = min( array_column( $headings, 'level' ) );
		$current_level = $min_level;

		foreach ( $headings as $heading ) {
			$level = $heading['level'];
			$text  = $heading['text'];
			$id    = $heading['id'];

			if ( $level > $current_level ) {
				for ( $i = $current_level; $i < $level; $i++ ) {
					$html .= '<' . $list_type . ' class="navygator-toc-list-nested">';
				}
			} elseif ( $level < $current_level ) {
				for ( $i = $level; $i < $current_level; $i++ ) {
					$html .= '</' . $list_type . '></li>';
				}
			} else {
				if ( $current_level !== $min_level || $heading !== $headings[0] ) {
					$html .= '</li>';
				}
			}

			$current_level = $level;

			$html .= '<li class="navygator-toc-item navygator-toc-item-level-' . esc_attr( $level ) . '">';
			$html .= '<a href="#' . esc_attr( $id ) . '" class="navygator-toc-link">';
			$html .= esc_html( $text );
			$html .= '</a>';
		}

		for ( $i = $min_level; $i <= $current_level; $i++ ) {
			$html .= '</li>';
			if ( $i > $min_level ) {
				$html .= '</' . $list_type . '>';
			}
		}

		$html .= '</' . $list_type . '>';

		return $html;
	}
}


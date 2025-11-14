<?php
// This file is generated. Do not modify it manually.
return array(
	'cozy-mode' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/cozy-mode',
		'version' => '0.1.0',
		'title' => 'Cozy Mode',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="7" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 8h8v1H8z" fill="currentColor"/><path d="M8 11h8v2H8z" fill="currentColor"/><path d="M8 15h8v1H8z" fill="currentColor"/></svg>'
		),
		'description' => 'Add a distraction-free reading toggle powered by Cozy Mode.',
		'attributes' => array(
			'buttonLabel' => array(
				'type' => 'string',
				'default' => 'Read in Cozy Mode'
			),
			'showHelperText' => array(
				'type' => 'boolean',
				'default' => true
			),
			'helperText' => array(
				'type' => 'string',
				'default' => 'Opens a focused reading interface with clean typography.'
			)
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./editor.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'date-now' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/date-now',
		'version' => '0.1.0',
		'title' => 'Date.now Calendar',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v2M16 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="6" y="8" width="12" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="11" width="3" height="3" fill="currentColor"/><rect x="14" y="11" width="3" height="3" fill="currentColor"/></svg>'
		),
		'description' => 'Display a Google Calendar feed with multiple views and a polished schedule layout.',
		'keywords' => array(
			'calendar',
			'google',
			'events',
			'schedule'
		),
		'attributes' => array(
			'calendarId' => array(
				'type' => 'string',
				'default' => ''
			),
			'defaultView' => array(
				'type' => 'string',
				'default' => 'week'
			),
			'showWeekends' => array(
				'type' => 'boolean',
				'default' => true
			),
			'eventLimit' => array(
				'type' => 'number',
				'default' => 3
			),
			'customHeadline' => array(
				'type' => 'string',
				'default' => ''
			),
			'customSubheadline' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'spacing' => array(
				'margin' => true,
				'padding' => true
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'flip-side' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/flip-side',
		'version' => '0.1.0',
		'title' => 'Flip Side',
		'category' => 'yokoi',
		'icon' => 'image-flip-horizontal',
		'description' => 'Create interactive flip cards with front/back content, navigation, and autoplay.',
		'example' => array(
			'attributes' => array(
				'cards' => array(
					array(
						'frontTitle' => 'Your Title Here',
						'backTitle' => 'More Details',
						'frontContent' => 'Add your main content here',
						'backContent' => 'Additional information revealed on hover'
					),
					array(
						'frontTitle' => 'Second Card',
						'backTitle' => 'Learn More',
						'frontContent' => 'Another piece of content',
						'backContent' => 'Extended details about this item'
					)
				)
			)
		),
		'attributes' => array(
			'cards' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 1,
						'frontTitle' => '',
						'backTitle' => '',
						'frontContent' => '',
						'backContent' => '',
						'frontImageId' => null,
						'frontImageUrl' => '',
						'frontImageAlt' => '',
						'backImageId' => null,
						'backImageUrl' => '',
						'backImageAlt' => ''
					)
				)
			),
			'currentCard' => array(
				'type' => 'number',
				'default' => 0
			),
			'cardWidth' => array(
				'type' => 'number',
				'default' => 300
			),
			'cardHeight' => array(
				'type' => 'number',
				'default' => 400
			),
			'frontColor' => array(
				'type' => 'string',
				'default' => '#6366f1'
			),
			'backColor' => array(
				'type' => 'string',
				'default' => '#ec4899'
			),
			'textColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'showNavigation' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showIndicators' => array(
				'type' => 'boolean',
				'default' => true
			),
			'autoPlay' => array(
				'type' => 'boolean',
				'default' => false
			),
			'autoPlayDelay' => array(
				'type' => 'number',
				'default' => 5000
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'left',
				'center',
				'right'
			),
			'color' => array(
				'background' => false,
				'text' => false,
				'gradients' => false,
				'link' => false
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	),
	'logo-parade' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/logo-parade',
		'version' => '1.0.0',
		'title' => 'Logo Parade',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5" y="8" width="14" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/></svg>'
		),
		'description' => 'Showcase client and partner logos in an endlessly scrolling parade.',
		'example' => array(
			'attributes' => array(
				'logos' => array(
					array(
						'id' => 1,
						'url' => 'https://picsum.photos/200/80?random=1',
						'alt' => 'Client Logo 1'
					),
					array(
						'id' => 2,
						'url' => 'https://picsum.photos/200/80?random=2',
						'alt' => 'Client Logo 2'
					),
					array(
						'id' => 3,
						'url' => 'https://picsum.photos/200/80?random=3',
						'alt' => 'Client Logo 3'
					),
					array(
						'id' => 4,
						'url' => 'https://picsum.photos/200/80?random=4',
						'alt' => 'Client Logo 4'
					),
					array(
						'id' => 5,
						'url' => 'https://picsum.photos/200/80?random=5',
						'alt' => 'Client Logo 5'
					)
				)
			)
		),
		'attributes' => array(
			'logos' => array(
				'type' => 'array',
				'default' => array(
					
				),
				'items' => array(
					'type' => 'object',
					'properties' => array(
						'id' => array(
							'type' => 'number'
						),
						'url' => array(
							'type' => 'string'
						),
						'alt' => array(
							'type' => 'string'
						),
						'linkUrl' => array(
							'type' => 'string'
						),
						'newTab' => array(
							'type' => 'boolean'
						)
					)
				)
			),
			'rotationSpeed' => array(
				'type' => 'number',
				'default' => 3000,
				'minimum' => 1000,
				'maximum' => 10000
			),
			'transitionDuration' => array(
				'type' => 'number',
				'default' => 500,
				'minimum' => 200,
				'maximum' => 2000
			),
			'pauseOnHover' => array(
				'type' => 'boolean',
				'default' => true
			),
			'logosPerView' => array(
				'type' => 'number',
				'default' => 4,
				'minimum' => 1,
				'maximum' => 8
			),
			'mobileLogosPerView' => array(
				'type' => 'number',
				'default' => 2,
				'minimum' => 1,
				'maximum' => 4
			),
			'hideOnMobile' => array(
				'type' => 'boolean',
				'default' => false
			),
			'logoHeight' => array(
				'type' => 'string',
				'default' => '60px'
			),
			'gapBetweenLogos' => array(
				'type' => 'number',
				'default' => 40,
				'minimum' => 0,
				'maximum' => 100
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'center',
				'enum' => array(
					'left',
					'center',
					'right'
				)
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'anchor' => true,
			'spacing' => array(
				'margin' => true,
				'padding' => true
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'navygator' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/navygator',
		'version' => '1.0.0',
		'title' => 'NavyGator Table of Contents',
		'category' => 'widgets',
		'icon' => 'list-view',
		'description' => 'Automatically generate a beautiful, floating table of contents from your page headings.',
		'keywords' => array(
			'toc',
			'table of contents',
			'navigation',
			'headings',
			'navygator'
		),
		'textdomain' => 'yokoi',
		'supports' => array(
			'html' => false,
			'align' => false,
			'multiple' => false,
			'reusable' => true
		),
		'attributes' => array(
			'headingLevels' => array(
				'type' => 'array',
				'default' => array(
					2,
					3,
					4
				),
				'items' => array(
					'type' => 'number'
				)
			),
			'showNumbers' => array(
				'type' => 'boolean',
				'default' => true
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Table of Contents'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => ''
			),
			'textColor' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'poppit' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/poppit',
		'version' => '0.1.0',
		'title' => 'Poppit',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h10v6h-4.5L11 16v-2H7V8z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15.5 9.5l-.6 1.1-1.2.2.9.9-.2 1.2 1.1-.6 1.1.6-.2-1.2.9-.9-1.2-.2-.6-1.1z" fill="currentColor"/></svg>'
		),
		'description' => 'Build pop-ups that feel like helpful suggestions, not annoying interruptions.',
		'example' => array(
			'attributes' => array(
				'popupType' => 'modal',
				'triggerType' => 'time',
				'triggerDelay' => 5,
				'title' => 'Subscribe to Our Newsletter',
				'content' => 'Get the latest updates and exclusive content delivered to your inbox.'
			)
		),
		'attributes' => array(
			'popupId' => array(
				'type' => 'string',
				'default' => ''
			),
			'popupType' => array(
				'type' => 'string',
				'default' => 'modal'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Pop-up Title'
			),
			'content' => array(
				'type' => 'string',
				'default' => 'Your pop-up content goes here.'
			),
			'triggerType' => array(
				'type' => 'string',
				'default' => 'time'
			),
			'triggerDelay' => array(
				'type' => 'number',
				'default' => 3
			),
			'scrollDepth' => array(
				'type' => 'number',
				'default' => 50
			),
			'exitIntent' => array(
				'type' => 'boolean',
				'default' => false
			),
			'showCloseButton' => array(
				'type' => 'boolean',
				'default' => true
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 0.8
			),
			'emailEnabled' => array(
				'type' => 'boolean',
				'default' => false
			),
			'emailPlaceholder' => array(
				'type' => 'string',
				'default' => 'Enter your email address'
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Subscribe'
			),
			'targeting' => array(
				'type' => 'object',
				'default' => array(
					'devices' => array(
						'desktop',
						'tablet',
						'mobile'
					),
					'userType' => 'all'
				)
			),
			'animation' => array(
				'type' => 'string',
				'default' => 'fadeIn'
			),
			'width' => array(
				'type' => 'string',
				'default' => '500px'
			),
			'height' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'position' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'allowReset' => array(
				'type' => 'boolean',
				'default' => false
			),
			'resetDelay' => array(
				'type' => 'number',
				'default' => 60
			)
		),
		'supports' => array(
			'html' => false,
			'color' => array(
				'background' => true,
				'text' => true,
				'gradients' => true
			),
			'typography' => array(
				'fontSize' => true,
				'fontFamily' => true,
				'lineHeight' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'border' => array(
				'radius' => true,
				'width' => true,
				'style' => true,
				'color' => true
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'squeeze-box' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/squeeze-box',
		'version' => '1.0.0',
		'title' => 'Squeeze Box',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h10v2H7V8Zm0 4h10v2H7v-2Zm0 4h10v2H7v-2Z" fill="currentColor"/></svg>'
		),
		'description' => 'Create accordion-style sections with single or multiple panels open at once.',
		'keywords' => array(
			'accordion',
			'collapsible',
			'tabs',
			'faq'
		),
		'example' => array(
			'attributes' => array(
				'items' => array(
					array(
						'title' => 'What\'s behind door #1?',
						'content' => 'This humble text box is ready to become whatever you need it to be. Go ahead, make it shine!',
						'isOpen' => true
					),
					array(
						'title' => 'Plot twist revealed here',
						'content' => 'This humble text box is ready to become whatever you need it to be. Go ahead, make it shine!',
						'isOpen' => false
					)
				),
				'mode' => 'multiple'
			)
		),
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					array(
						'title' => '',
						'content' => '',
						'isOpen' => false
					),
					array(
						'title' => '',
						'content' => '',
						'isOpen' => false
					)
				)
			),
			'mode' => array(
				'type' => 'string',
				'default' => 'multiple',
				'enum' => array(
					'multiple',
					'single'
				)
			),
			'primaryColor' => array(
				'type' => 'string',
				'default' => '#227093'
			),
			'uniqueId' => array(
				'type' => 'string'
			)
		),
		'supports' => array(
			'html' => false,
			'spacing' => array(
				'margin' => true,
				'padding' => true
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./editor.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	),
	'ticker-tape-parade' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/ticker-tape-parade',
		'version' => '0.1.0',
		'title' => 'Ticker Tape Parade',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h10M7 12h6M7 16h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 11l3 1.5-3 1.5V11z" fill="currentColor"/></svg>'
		),
		'description' => 'A customizable horizontal scrolling ticker for announcements and headlines.',
		'example' => array(
			'attributes' => array(
				'content' => 'Breaking News: New Product Launch • Special Offer: 50% Off This Week • Update: Server Maintenance Tonight',
				'speed' => 30,
				'textColor' => '#111827',
				'backgroundColor' => '#ffffff',
				'fontSize' => 18,
				'hasBackground' => true
			)
		),
		'attributes' => array(
			'content' => array(
				'type' => 'string',
				'default' => 'Enter your ticker text here • Separate items with bullet points or line breaks'
			),
			'speed' => array(
				'type' => 'number',
				'default' => 30
			),
			'textColor' => array(
				'type' => 'string',
				'default' => '#111827'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'fontSize' => array(
				'type' => 'number',
				'default' => 18
			),
			'pauseOnHover' => array(
				'type' => 'boolean',
				'default' => true
			),
			'textTransform' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'fontWeight' => array(
				'type' => 'string',
				'default' => 'normal'
			),
			'hasBackground' => array(
				'type' => 'boolean',
				'default' => false
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'color' => array(
				'text' => true,
				'background' => true,
				'gradients' => false
			)
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	),
	'webwindow' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/webwindow',
		'version' => '0.1.0',
		'title' => 'WebWindow',
		'category' => 'yokoi',
		'icon' => array(
			'src' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5" y="7" width="14" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 11.5 8 13l2 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11.5 16 13l-2 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
		),
		'description' => 'Embed external sites inside a responsive browser frame with optional scale-to-fit zoom.',
		'keywords' => array(
			'embed',
			'iframe',
			'browser',
			'preview'
		),
		'example' => array(
			'attributes' => array(
				'src' => 'https://demo.iconick.io/twombly/',
				'scaleToFit' => true
			)
		),
		'attributes' => array(
			'src' => array(
				'type' => 'string',
				'default' => 'https://demo.iconick.io/twombly/'
			),
			'scaleToFit' => array(
				'type' => 'boolean',
				'default' => true
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'layout' => true
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./editor.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	)
);

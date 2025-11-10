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
		'icon' => 'book-alt',
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
		'icon' => 'calendar-alt',
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
	'poppit' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/poppit',
		'version' => '0.1.0',
		'title' => 'Poppit',
		'category' => 'yokoi',
		'icon' => 'megaphone',
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
	'ticker-tape-parade' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/ticker-tape-parade',
		'version' => '0.1.0',
		'title' => 'Ticker Tape Parade',
		'category' => 'yokoi',
		'icon' => 'controls-forward',
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
		'icon' => 'media-code',
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
	),
	'squeeze-box' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'yokoi/squeeze-box',
		'version' => '1.0.0',
		'title' => 'Squeeze Box',
		'category' => 'yokoi',
		'icon' => 'admin-collapse',
		'description' => 'Create accordion-style sections with single or multiple panels open at once.',
		'example' => array(
			'attributes' => array(
				'items' => array(
					array(
						'title' => "What's behind door #1?",
						'content' => 'This humble text box is ready to become whatever you need it to be. Go ahead, make it shine!',
						'isOpen' => true,
					),
					array(
						'title' => 'Plot twist revealed here',
						'content' => 'This humble text box is ready to become whatever you need it to be. Go ahead, make it shine!',
						'isOpen' => false,
					),
				),
				'mode' => 'multiple',
			),
		),
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					array(
						'title' => '',
						'content' => '',
						'isOpen' => false,
					),
					array(
						'title' => '',
						'content' => '',
						'isOpen' => false,
					),
				),
			),
			'mode' => array(
				'type' => 'string',
				'default' => 'multiple',
				'enum' => array( 'multiple', 'single' ),
			),
			'primaryColor' => array(
				'type' => 'string',
				'default' => '#227093',
			),
			'uniqueId' => array(
				'type' => 'string',
			),
		),
		'supports' => array(
			'html' => false,
			'spacing' => array(
				'margin' => true,
				'padding' => true,
			),
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
		'icon' => 'slides',
		'description' => 'Showcase client and partner logos in an endlessly scrolling parade.',
		'example' => array(
			'attributes' => array(
				'logos' => array(
					array(
						'id' => 1,
						'url' => 'https://picsum.photos/200/80?random=1',
						'alt' => 'Client Logo 1',
					),
					array(
						'id' => 2,
						'url' => 'https://picsum.photos/200/80?random=2',
						'alt' => 'Client Logo 2',
					),
					array(
						'id' => 3,
						'url' => 'https://picsum.photos/200/80?random=3',
						'alt' => 'Client Logo 3',
					),
					array(
						'id' => 4,
						'url' => 'https://picsum.photos/200/80?random=4',
						'alt' => 'Client Logo 4',
					),
					array(
						'id' => 5,
						'url' => 'https://picsum.photos/200/80?random=5',
						'alt' => 'Client Logo 5',
					),
				),
			),
		),
		'attributes' => array(
			'logos' => array(
				'type' => 'array',
				'default' => array(),
			),
			'rotationSpeed' => array(
				'type' => 'number',
				'default' => 3000,
			),
			'transitionDuration' => array(
				'type' => 'number',
				'default' => 500,
			),
			'pauseOnHover' => array(
				'type' => 'boolean',
				'default' => true,
			),
			'logosPerView' => array(
				'type' => 'number',
				'default' => 4,
			),
			'mobileLogosPerView' => array(
				'type' => 'number',
				'default' => 2,
			),
			'hideOnMobile' => array(
				'type' => 'boolean',
				'default' => false,
			),
			'logoHeight' => array(
				'type' => 'string',
				'default' => '60px',
			),
			'gapBetweenLogos' => array(
				'type' => 'number',
				'default' => 40,
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent',
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'center',
			),
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full',
			),
			'anchor' => true,
			'spacing' => array(
				'margin' => true,
				'padding' => true,
			),
		),
		'textdomain' => 'yokoi',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'render' => 'file:./render.php',
	),
);

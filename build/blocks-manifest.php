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
	)
);

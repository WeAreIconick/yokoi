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
	)
);

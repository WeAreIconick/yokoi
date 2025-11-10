export default {
	'*.php': [
		'vendor/bin/phpcbf',
		'vendor/bin/phpcs',
	],
	'*.{js,jsx,ts,tsx}': [
		'wp-scripts format',
		'wp-scripts lint-js',
	],
	'*.{css,scss}': [
		'wp-scripts lint-style --fix',
	],
};


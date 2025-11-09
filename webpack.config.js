const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: async () => {
		const entries = await defaultConfig.entry();

		return {
			...entries,
			sidebar: path.resolve( __dirname, 'src/sidebar/index.js' ),
		};
	},
};

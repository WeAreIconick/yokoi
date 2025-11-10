<?php
// phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Settings UI for Date.now block.
 *
 * @package Yokoi
 */

namespace Yokoi\Date_Now;

use function add_options_page;
use function check_admin_referer;
use function current_user_can;
use function esc_attr;
use function esc_html__;
use function esc_html_e;
use function get_option;
use function sanitize_text_field;
use function update_option;
use function wp_die;
use function wp_nonce_field;
use function wp_unslash;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides a small settings screen for the Google API key.
 */
class Settings_Page {
	private const OPTION_KEY = 'yokoi_date_now_api_key';

	public function hooks(): void {
		add_options_page(
			__( 'Date.now Calendar', 'yokoi' ),
			__( 'Date.now Calendar', 'yokoi' ),
			'manage_options',
			'yokoi-date-now',
			array( $this, 'render' )
		);
	}

	/**
	 * Render callback for wp-admin.
	 */
	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to view this screen.', 'yokoi' ) );
		}

		if ( isset( $_POST['yokoi_date_now_save'] ) ) {
			check_admin_referer( 'yokoi_date_now_save_settings' );

			$key = sanitize_text_field( wp_unslash( $_POST['yokoi_date_now_api_key'] ?? '' ) );
			update_option( self::OPTION_KEY, $key );

			echo '<div class="notice notice-success"><p>' . esc_html__( 'API key saved.', 'yokoi' ) . '</p></div>';
		}

		$current = (string) get_option( self::OPTION_KEY, '' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Date.now Calendar', 'yokoi' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Provide a Google Calendar API key to fetch events for the Date.now block.', 'yokoi' ); ?>
			</p>
			<form method="post" action="">
				<?php wp_nonce_field( 'yokoi_date_now_save_settings' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">
							<label for="yokoi_date_now_api_key"><?php esc_html_e( 'Google API key', 'yokoi' ); ?></label>
						</th>
						<td>
							<input
								type="text"
								id="yokoi_date_now_api_key"
								name="yokoi_date_now_api_key"
								class="regular-text"
								value="<?php echo esc_attr( $current ); ?>"
								placeholder="AIza..."
								required
							/>
							<p class="description">
								<?php esc_html_e( 'Create a key in the Google Cloud Console with Calendar API access.', 'yokoi' ); ?>
							</p>
						</td>
					</tr>
				</table>
				<p class="submit">
					<button type="submit" class="button button-primary" name="yokoi_date_now_save">
						<?php esc_html_e( 'Save API key', 'yokoi' ); ?>
					</button>
				</p>
			</form>
		</div>
		<?php
	}
}


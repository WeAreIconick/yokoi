import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	TextareaControl,
	TextControl,
	SelectControl,
	ToggleControl,
	RangeControl,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

import './editor.scss';

const VIEW_OPTIONS = [
	{ label: __( 'Week', 'yokoi' ), value: 'week' },
	{ label: __( 'Day', 'yokoi' ), value: 'day' },
	{ label: __( 'Month', 'yokoi' ), value: 'month' },
];

const Edit = ( { attributes, setAttributes } ) => {
	const {
		calendarId,
		defaultView,
		showWeekends,
		eventLimit,
		customHeadline,
		customSubheadline,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'yokoi-date-now-block',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Calendar Settings', 'yokoi' ) }
					initialOpen={ true }
				>
					<BaseControl>
						<TextControl
							label={ __(
								'Google Calendar ID or Share URL',
								'yokoi'
							) }
							value={ calendarId }
							onChange={ ( value ) =>
								setAttributes( { calendarId: value } )
							}
							placeholder="https://calendar.google.com/calendar/..."
							help={ __(
								'Paste the share URL or calendar ID from Google Calendar.',
								'yokoi'
							) }
						/>
					</BaseControl>
					<SelectControl
						label={ __( 'Default View', 'yokoi' ) }
						value={ defaultView }
						options={ VIEW_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { defaultView: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Show Weekends', 'yokoi' ) }
						checked={ showWeekends }
						onChange={ ( value ) =>
							setAttributes( { showWeekends: value } )
						}
					/>
					<RangeControl
						label={ __(
							'Events per Day (month view)',
							'yokoi'
						) }
						value={ eventLimit }
						onChange={ ( value ) =>
							setAttributes( { eventLimit: value } )
						}
						min={ 1 }
						max={ 10 }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Optional Headline', 'yokoi' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Headline', 'yokoi' ) }
						value={ customHeadline }
						onChange={ ( value ) =>
							setAttributes( { customHeadline: value } )
						}
						placeholder={ __(
							'Upcoming events',
							'yokoi'
						) }
					/>
					<TextareaControl
						label={ __( 'Subheadline', 'yokoi' ) }
						value={ customSubheadline }
						onChange={ ( value ) =>
							setAttributes( { customSubheadline: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ calendarId ? (
					<div className="yokoi-date-now-preview">
						<ServerSideRender
							block="yokoi/date-now"
							attributes={ attributes }
							LoadingResponsePlaceholder={ () => (
								<div className="yokoi-date-now-preview__loading">
									<Spinner />
									<p>{ __( 'Loading calendar…', 'yokoi' ) }</p>
								</div>
							) }
							ErrorResponsePlaceholder={ ( { response } ) => (
								<div className="yokoi-date-now-preview__error">
									<strong>
										{ __(
											'Unable to render calendar',
											'yokoi'
										) }
									</strong>
									<p>
										{ response?.message ||
											__( 'Unknown error.', 'yokoi' ) }
									</p>
								</div>
							) }
						/>
					</div>
				) : (
					<Placeholder
						icon="calendar-alt"
						label={ __( 'Date.now', 'yokoi' ) }
						instructions={ __(
							'Paste a Google Calendar share URL or ID in the block settings.',
							'yokoi'
						) }
					>
						<p>
							{ __(
								'Need an API key? Visit the Date.now settings page after activating the block.',
								'yokoi'
							) }
						</p>
					</Placeholder>
				) }
			</div>
		</>
	);
};

export default Edit;


import { __ } from '@wordpress/i18n';

const HOURS = Array.from( { length: 11 }, ( _, index ) => 10 + index );
const WEEKDAY_NAMES = [
	__( 'Sunday', 'yokoi' ),
	__( 'Monday', 'yokoi' ),
	__( 'Tuesday', 'yokoi' ),
	__( 'Wednesday', 'yokoi' ),
	__( 'Thursday', 'yokoi' ),
	__( 'Friday', 'yokoi' ),
	__( 'Saturday', 'yokoi' ),
];

const stateStore = new WeakMap();

const parseISO = ( value ) => {
	if ( ! value ) {
		return null;
	}

	// Safari-safe parse.
	const normalized = value.replace( /-/g, '/' );
	const date = new Date( normalized );

	if ( Number.isNaN( date.getTime() ) ) {
		return null;
	}

	return date;
};

const formatTime = ( date ) =>
	date.toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit' } );

const formatDate = ( date ) =>
	date.toLocaleDateString( [], {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	} );

const clampToWeekStart = ( date ) => {
	const result = new Date( date );
	const day = result.getDay();

	result.setHours( 0, 0, 0, 0 );
	result.setDate( result.getDate() - day );

	return result;
};

const addDays = ( date, days ) => {
	const next = new Date( date );
	next.setDate( next.getDate() + days );

	return next;
};

const formatMonthHeading = ( start, end ) => {
	const sameMonth = start.getMonth() === end.getMonth();
	const sameYear = start.getFullYear() === end.getFullYear();

	if ( sameMonth && sameYear ) {
		return start.toLocaleDateString( [], { month: 'long', year: 'numeric' } );
	}

	if ( sameYear ) {
		return `${ start.toLocaleDateString( [], { month: 'short' } ) } – ${ end.toLocaleDateString( [], { month: 'short', year: 'numeric' } ) }`;
	}

	return `${ start.toLocaleDateString( [], { month: 'short', year: 'numeric' } ) } – ${ end.toLocaleDateString( [], { month: 'short', year: 'numeric' } ) }`;
};

const buildEvent = ( raw ) => {
	const start = parseISO( raw.start );
	const end = parseISO( raw.end ) || start;

	return {
		id: raw.id,
		title: raw.title || __( 'Untitled event', 'yokoi' ),
		description: raw.description || '',
		location: raw.location || '',
		link: raw.link || '',
		allDay: Boolean( raw.allDay ),
		start,
		end,
	};
};

const parseEvents = ( jsonString ) => {
	try {
		const parsed = JSON.parse( jsonString || '[]' );
		return parsed.map( buildEvent ).filter( ( event ) => event.start );
	} catch ( error ) {
		// Only log in debug mode to avoid console noise
		if ( typeof window !== 'undefined' && window.yokoiDebug ) {
			// eslint-disable-next-line no-console
			console.warn( 'Date.now: invalid events payload', error );
		}
		return [];
	}
};

const createElement = ( tag, className, text ) => {
	const element = document.createElement( tag );
	if ( className ) {
		element.className = className;
	}
	if ( text ) {
		element.textContent = text;
	}
	return element;
};

const renderHeader = ( wrapper, state, setState ) => {
	const header = createElement( 'div', 'yokoi-date-now__header' );

	const headlineWrapper = createElement( 'div', 'yokoi-date-now__headline' );

	const title = state.headline || __( 'Date.now', 'yokoi' );
	const subtitle = state.subheadline || __( 'A calm overview of your upcoming schedule.', 'yokoi' );

	headlineWrapper.append(
		createElement( 'div', 'yokoi-date-now__headline-title', title ),
		createElement( 'div', 'yokoi-date-now__headline-subtitle', subtitle )
	);

	const controls = createElement( 'div', 'yokoi-date-now__controls' );

	const todayButton = createElement( 'button', '', __( 'Today', 'yokoi' ) );
	todayButton.addEventListener( 'click', () => {
		setState( { currentDate: new Date() } );
	} );

	const prevButton = createElement( 'button', '' );
	prevButton.setAttribute( 'aria-label', __( 'Previous period', 'yokoi' ) );
	prevButton.innerHTML = '←';
	prevButton.addEventListener( 'click', () => {
		const diff = state.view === 'month' ? -30 : -7;
		setState( { currentDate: addDays( state.currentDate, diff ) } );
	} );

	const nextButton = createElement( 'button', '' );
	nextButton.setAttribute( 'aria-label', __( 'Next period', 'yokoi' ) );
	nextButton.innerHTML = '→';
	nextButton.addEventListener( 'click', () => {
		const diff = state.view === 'month' ? 30 : 7;
		setState( { currentDate: addDays( state.currentDate, diff ) } );
	} );

	controls.append( prevButton, todayButton, nextButton );

	const dots = createElement( 'div', 'yokoi-date-now__controls' );

	const views = [
		{ key: 'day', label: __( 'Day', 'yokoi' ) },
		{ key: 'week', label: __( 'Week', 'yokoi' ) },
		{ key: 'month', label: __( 'Month', 'yokoi' ) },
	];

	views.forEach( ( { key, label } ) => {
		const button = createElement( 'button', '', label );

		if ( state.view === key ) {
			button.setAttribute( 'aria-current', 'true' );
		}

		button.addEventListener( 'click', () => {
			setState( { view: key } );
		} );

		dots.append( button );
	} );

	if ( state.view !== 'day' ) {
		const weekendsToggle = createElement( 'button', '' );
		weekendsToggle.textContent = state.showWeekends
			? __( 'Hide weekends', 'yokoi' )
			: __( 'Show weekends', 'yokoi' );

		weekendsToggle.addEventListener( 'click', () => {
			setState( { showWeekends: ! state.showWeekends } );
		} );

		dots.append( weekendsToggle );
	}

	header.append( headlineWrapper, controls, dots );
	wrapper.append( header );
};

const renderWeekView = ( wrapper, state ) => {
	const weekStart = clampToWeekStart( state.currentDate );
	const days = Array.from( { length: 7 }, ( _, index ) => addDays( weekStart, index ) )
		.filter( ( day, index ) => state.showWeekends || ( index !== 0 && index !== 6 ) );

	const heading = createElement(
		'h2',
		'yokoi-date-now__range-heading',
		formatMonthHeading( days[ 0 ], days[ days.length - 1 ] )
	);

	wrapper.append( heading );

	const calendar = createElement( 'div', 'yokoi-date-now__calendar' );

	const timeColumn = createElement( 'div', 'yokoi-date-now__time-column' );
	HOURS.forEach( ( hour ) => {
		const slot = createElement( 'span', '', `${ hour }:00` );
		timeColumn.append( slot );
	} );

	calendar.append( timeColumn );

	days.forEach( ( date ) => {
		const dayColumn = createElement( 'div', 'yokoi-date-now__day-column' );
		const isToday = date.toDateString() === new Date().toDateString();

		if ( isToday ) {
			dayColumn.classList.add( 'yokoi-date-now__day-column--today' );
		}

		const header = createElement( 'div', 'yokoi-date-now__day-header' );
		header.append(
			createElement(
				'span',
				'yokoi-date-now__day-header-name',
				WEEKDAY_NAMES[ date.getDay() ]
			)
		);

		const number = createElement(
			'span',
			'yokoi-date-now__day-header-date' + ( isToday ? ' yokoi-date-now__day-header-date--today' : '' ),
			String( date.getDate() )
		);
		header.append( number );

		const grid = createElement( 'div', 'yokoi-date-now__grid' );
		HOURS.forEach( () => {
			grid.append( createElement( 'div', 'yokoi-date-now__grid-slot' ) );
		} );

		const eventsLayer = createElement( 'div', 'yokoi-date-now__events-layer' );

		const dayEvents = state.events.filter(
			( event ) => event.start && event.start.toDateString() === date.toDateString()
		);

		dayEvents.forEach( ( event ) => {
			const startHour = event.start.getHours() + event.start.getMinutes() / 60;
			const endHour = ( event.end ? event.end.getHours() : startHour ) + ( event.end ? event.end.getMinutes() : 0 ) / 60;
			const duration = Math.max( endHour - startHour, 0.5 );

			const eventElement = createElement( 'div', 'yokoi-date-now__event' );

			const topOffset = Math.max( 0, ( startHour - 10 ) * 56 );
			const height = Math.max( 44, duration * 56 );

			eventElement.style.top = `${ topOffset }px`;
			eventElement.style.height = `${ height }px`;

			eventElement.append(
				createElement( 'span', 'yokoi-date-now__event-time', `${ formatTime( event.start ) } – ${ formatTime( event.end || event.start ) }` ),
				createElement( 'span', 'yokoi-date-now__event-title', event.title ),
				event.location
					? createElement( 'span', 'yokoi-date-now__event-location', event.location )
					: null
			);

			eventElement.addEventListener( 'click', () => openPopup( event ) );
			eventsLayer.append( eventElement );
		} );

		dayColumn.append( header, grid, eventsLayer );
		calendar.append( dayColumn );
	} );

	wrapper.append( calendar );
};

const renderDayView = ( wrapper, state ) => {
	const current = state.currentDate;
	const heading = createElement( 'h2', 'yokoi-date-now__range-heading', formatDate( current ) );

	wrapper.append( heading );

	const events = state.events.filter(
		( event ) => event.start && event.start.toDateString() === current.toDateString()
	);

	if ( events.length === 0 ) {
		wrapper.append(
			createElement( 'div', 'yokoi-date-now__empty', __( 'No events for this day.', 'yokoi' ) )
		);
		return;
	}

	const list = createElement( 'div', 'yokoi-date-now__day-list' );

	events
		.sort( ( a, b ) => a.start - b.start )
		.forEach( ( event ) => {
			const card = createElement( 'div', 'yokoi-date-now__event yokoi-date-now__event--day' );
			card.append(
				createElement( 'span', 'yokoi-date-now__event-time', `${ formatTime( event.start ) } – ${ formatTime( event.end || event.start ) }` ),
				createElement( 'span', 'yokoi-date-now__event-title', event.title ),
				event.location ? createElement( 'span', 'yokoi-date-now__event-location', event.location ) : null
			);

			card.addEventListener( 'click', () => openPopup( event ) );
			list.append( card );
		} );

	wrapper.append( list );
};

const renderMonthView = ( wrapper, state ) => {
	const monthStart = new Date( state.currentDate.getFullYear(), state.currentDate.getMonth(), 1 );
	const monthEnd = new Date( state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 0 );

	const heading = createElement(
		'h2',
		'yokoi-date-now__range-heading',
		monthStart.toLocaleDateString( [], { month: 'long', year: 'numeric' } )
	);
	wrapper.append( heading );

	const daysInMonth = monthEnd.getDate();
	const grid = createElement( 'div', 'yokoi-date-now__month-grid' );

	for ( let day = 1; day <= daysInMonth; day++ ) {
		const current = new Date( monthStart.getFullYear(), monthStart.getMonth(), day );

		const cell = createElement( 'div', 'yokoi-date-now__month-cell' );

		const headingWrapper = createElement( 'div', 'yokoi-date-now__month-cell-heading' );
		headingWrapper.append(
			createElement( 'span', 'yokoi-date-now__month-cell-day', String( day ) ),
			createElement( 'span', 'yokoi-date-now__month-cell-weekday', WEEKDAY_NAMES[ current.getDay() ].slice( 0, 3 ) )
		);

		cell.append( headingWrapper );

		const dayEvents = state.events
			.filter( ( event ) => event.start && event.start.getMonth() === current.getMonth() && event.start.getDate() === day )
			.sort( ( a, b ) => a.start - b.start );

		if ( dayEvents.length === 0 ) {
			grid.append( cell );
			continue;
		}

		const list = createElement( 'ul', 'yokoi-date-now__month-events' );
		dayEvents.slice( 0, state.eventLimit ).forEach( ( event ) => {
			const item = createElement( 'li', 'yokoi-date-now__month-event' );
			item.append(
				createElement( 'span', 'yokoi-date-now__month-event-time', formatTime( event.start ) ),
				createElement( 'span', 'yokoi-date-now__month-event-title', event.title )
			);
			item.addEventListener( 'click', () => openPopup( event ) );
			list.append( item );
		} );

		if ( dayEvents.length > state.eventLimit ) {
			list.append(
				createElement(
					'span',
					'yokoi-date-now__month-event-more',
					__( 'See all events', 'yokoi' )
				)
			);
		}

		cell.append( list );
		grid.append( cell );
	}

	wrapper.append( grid );
};

const renderView = ( card, state, setState ) => {
	card.innerHTML = '';

	renderHeader( card, state, setState );

	const body = createElement( 'div', 'yokoi-date-now__body' );

	switch ( state.view ) {
		case 'day':
			renderDayView( body, state );
			break;
		case 'month':
			renderMonthView( body, state );
			break;
		default:
			renderWeekView( body, state );
			break;
	}

	card.append( body );
};

const openPopup = ( event ) => {
	const overlay = createElement( 'div', 'yokoi-date-now__popup-overlay' );
	const modal = createElement( 'div', 'yokoi-date-now__popup' );

	const header = createElement( 'div', 'yokoi-date-now__popup-header' );
	header.append(
		createElement( 'h3', '', event.title ),
		createElement( 'button', '', '×' )
	);

	const meta = createElement( 'div', 'yokoi-date-now__popup-meta' );
	meta.append(
		createElement( 'span', '', formatDate( event.start ) ),
		createElement( 'span', '', `${ formatTime( event.start ) } – ${ formatTime( event.end || event.start ) }` )
	);

	if ( event.location ) {
		meta.append( createElement( 'span', '', event.location ) );
	}

	const description = createElement(
		'p',
		'yokoi-date-now__popup-description' + ( event.description ? '' : ' yokoi-date-now__popup-description--empty' ),
		event.description || __( 'No additional details provided.', 'yokoi' )
	);

	const footer = createElement( 'div', 'yokoi-date-now__popup-footer' );
	if ( event.link ) {
		const link = createElement( 'a', '', __( 'Open in Google Calendar', 'yokoi' ) );
		link.href = event.link;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		footer.append( link );
	}

	modal.append( header, meta, description, footer );
	overlay.append( modal );
	document.body.append( overlay );

	const close = () => {
		overlay.remove();
	};

	overlay.addEventListener( 'click', ( eventClick ) => {
		if ( eventClick.target === overlay ) {
			close();
		}
	} );
	header.querySelector( 'button' ).addEventListener( 'click', close );
};

const mount = ( card ) => {
	const state = {
		events: parseEvents( card.dataset.events ),
		currentDate: new Date(),
		view: card.dataset.defaultView || 'week',
		showWeekends: card.dataset.showWeekends !== '0',
		eventLimit: Number.parseInt( card.dataset.eventLimit || '3', 10 ),
		headline: card.dataset.headline || '',
		subheadline: card.dataset.subheadline || '',
	};

	const setState = ( updates ) => {
		const next = { ...stateStore.get( card ), ...updates };
		stateStore.set( card, next );
		renderView( card, next, setState );
	};

	stateStore.set( card, state );
	renderView( card, state, setState );
};

const init = () => {
	const cards = document.querySelectorAll( '.yokoi-date-now__card' );
	if ( ! cards.length ) {
		return;
	}

	cards.forEach( ( card ) => mount( card ) );
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}


import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

const TickerTapeParadeIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
		<path d="M7 8h10M7 12h6M7 16h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
		<path d="M16 11l3 1.5-3 1.5V11z" fill="currentColor"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: TickerTapeParadeIcon,
	edit: Edit,
	save,
} );


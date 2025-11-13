import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

const DateNowIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
		<path d="M8 4v2M16 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
		<rect x="6" y="8" width="12" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
		<rect x="9" y="11" width="3" height="3" fill="currentColor"/>
		<rect x="14" y="11" width="3" height="3" fill="currentColor"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: DateNowIcon,
	edit: Edit,
	save,
} );


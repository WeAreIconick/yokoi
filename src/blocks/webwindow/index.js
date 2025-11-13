import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

const WebWindowIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
		<rect x="5" y="7" width="14" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
		<path d="M10 11.5 8 13l2 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M14 11.5 16 13l-2 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: WebWindowIcon,
	edit: Edit,
	save,
} );


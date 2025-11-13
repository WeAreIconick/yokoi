import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

const PoppitIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
		<path d="M7 8h10v6h-4.5L11 16v-2H7V8z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
		<path d="M15.5 9.5l-.6 1.1-1.2.2.9.9-.2 1.2 1.1-.6 1.1.6-.2-1.2.9-.9-1.2-.2-.6-1.1z" fill="currentColor"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: PoppitIcon,
	edit: Edit,
	save,
} );

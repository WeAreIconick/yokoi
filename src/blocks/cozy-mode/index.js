import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

// Create icon component from SVG string
const CozyModeIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
		<rect x="6" y="7" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
		<path d="M8 8h8v1H8z" fill="currentColor"/>
		<path d="M8 11h8v2H8z" fill="currentColor"/>
		<path d="M8 15h8v1H8z" fill="currentColor"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: CozyModeIcon,
	edit: Edit,
	save,
} );


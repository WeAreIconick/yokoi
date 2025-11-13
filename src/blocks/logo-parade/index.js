import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';

// Create icon component from SVG string
const LogoParadeIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="5" y="8" width="14" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
		<circle cx="9" cy="12" r="1.5" fill="currentColor"/>
		<circle cx="12" cy="12" r="1.5" fill="currentColor"/>
		<circle cx="15" cy="12" r="1.5" fill="currentColor"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: LogoParadeIcon,
	edit: Edit,
	save,
} );


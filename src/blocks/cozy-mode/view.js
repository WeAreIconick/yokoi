import Readability from './readability';

// Define CozyMode class first (before initialization)
class CozyMode {
	constructor() {
		this.modal = null;
		this.backdrop = null;
		this.container = null;
		this.title = null;
		this.content = null;
		this.loading = null;
		this.closeButton = null;
		this.controls = null;
		this.isActive = false;
		this.focusableElements = [];
		this.firstFocusableElement = null;
		this.lastFocusableElement = null;
		this.previousActiveElement = null;
		this.currentFontSize = 18;
		this.isDarkMode = false;
		this.retryCount = 0;
		this.maxRetries = 3;

		this.init();
	}

	init() {
		this.loadPreferences();
		this.bindEvents();
		this.setupElements();
		this.setupPerformanceMonitoring();
	}

	setupPerformanceMonitoring() {
		if ('performance' in window) {
		this.performanceStart = performance.now();
		}
	}

	loadPreferences() {
		try {
		const preferences = localStorage.getItem('cozyModePreferences');
		if (preferences) {
			const prefs = JSON.parse(preferences);
			this.currentFontSize = prefs.fontSize || 18;
			this.isDarkMode = prefs.darkMode || false;
		}
		} catch (error) {
		// eslint-disable-next-line no-console
		console.warn('Cozy Mode: Could not load preferences:', error);
		}
	}

	savePreferences() {
		try {
				const preferences = {
					fontSize: this.currentFontSize,
					darkMode: this.isDarkMode,
					lastUsed: new Date().toISOString(),
					version: window.cozyMode?.version || '1.0.0',
				};
		localStorage.setItem(
			'cozyModePreferences',
			JSON.stringify(preferences)
		);
		} catch (error) {
		// eslint-disable-next-line no-console
		console.warn('Cozy Mode: Could not save preferences:', error);
		}
	}

	bindEvents() {
		// Use event delegation with passive listeners for better performance
		// Single delegated click handler for all cozy-mode interactions
		document.addEventListener('click', (event) => {
		const toggle = event.target.closest('.cozy-mode-toggle');
		if (toggle) {
			event.preventDefault();
			this.handleToggleClick(event);
			return;
		}

		const closeBtn = event.target.closest('.cozy-mode-close');
		if (closeBtn) {
			event.preventDefault();
			this.closeModal();
			return;
		}

		const control = event.target.closest('.cozy-mode-control');
		if (control) {
			event.preventDefault();
			if (control.classList.contains('cozy-mode-font-decrease')) {
				this.decreaseFontSize();
			} else if (control.classList.contains('cozy-mode-font-reset')) {
				this.resetFontSize();
			} else if (control.classList.contains('cozy-mode-font-increase')) {
				this.increaseFontSize();
			} else if (control.classList.contains('cozy-mode-theme-toggle')) {
				this.toggleTheme();
			} else if (control.classList.contains('cozy-mode-print')) {
				this.printArticle();
			} else if (control.classList.contains('cozy-mode-close-error')) {
				const errorContainer = control.closest('.cozy-mode-error');
				if (errorContainer) {
					errorContainer.style.display = 'none';
					this.closeModal();
				}
			}
			return;
		}

		// Handle overlay click
		if (this.isActive && this.modal && event.target.classList.contains('cozy-mode-click-overlay')) {
			this.closeModal();
		}
		}, { passive: false });

		// Keyboard handlers
		document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && this.isActive) {
			this.closeModal();
			return;
		}

		if (this.isActive && event.key === 'Tab') {
			this.handleTabKey(event);
		}
		}, { passive: true });

		// Debounced resize handler with passive listener
		window.addEventListener(
		'resize',
		this.debounce(() => {
			this.handleResize();
		}, 250),
		{ passive: true }
		);
	}

	handleToggleClick(event) {
		const button = event.target.closest('.cozy-mode-toggle');
		const postId = button?.dataset.postId;

		if (!postId) {
		// eslint-disable-next-line no-console
		console.error('Cozy Mode: Post ID not found');
		return;
		}

		this.setButtonLoading(button, true);
		this.openModalWithRetry();
	}

	setButtonLoading(button, loading) {
		if (loading) {
		button.disabled = true;
		button.classList.add('loading');
		const icon = button.querySelector('.cozy-mode-icon');
		if (icon) {
			// Use createElement for security instead of innerHTML
			icon.textContent = '';
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '18');
			svg.setAttribute('height', '18');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', '12');
			circle.setAttribute('cy', '12');
			circle.setAttribute('r', '10');
			circle.setAttribute('stroke', 'currentColor');
			circle.setAttribute('stroke-width', '2');
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M12 6v6l4 2');
			path.setAttribute('stroke', 'currentColor');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('stroke-linecap', 'round');
			svg.appendChild(circle);
			svg.appendChild(path);
			icon.appendChild(svg);
		}
		} else {
		button.disabled = false;
		button.classList.remove('loading');
		const icon = button.querySelector('.cozy-mode-icon');
		if (icon) {
			// Use createElement for security instead of innerHTML
			icon.textContent = '';
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '18');
			svg.setAttribute('height', '18');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M4 6H20M4 12H20M4 18H14');
			path.setAttribute('stroke', 'currentColor');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('stroke-linecap', 'round');
			path.setAttribute('stroke-linejoin', 'round');
			svg.appendChild(path);
			icon.appendChild(svg);
		}
		}
	}

	async openModalWithRetry() {
		try {
		await this.openModal();
		this.retryCount = 0;
		} catch (error) {
		this.retryCount += 1;
		if (this.retryCount < this.maxRetries) {
			// eslint-disable-next-line no-console
			console.warn(
				`Cozy Mode: Retry ${this.retryCount}/${this.maxRetries}`
			);
			setTimeout(
				() => this.openModalWithRetry(),
				1000 * this.retryCount
			);
		} else {
			// eslint-disable-next-line no-console
			console.error('Cozy Mode: Max retries exceeded');
			this.showError(
				'Maximum retry attempts exceeded. Please refresh the page.'
			);
		}
		}
	}

	setupElements() {
		// Try to find elements, but don't error if they don't exist yet
		// The modal might not be rendered until the block is actually used
		// Ensure we only get the first modal if multiple exist (shouldn't happen, but safety check)
		const modals = document.querySelectorAll('#cozy-mode-modal');
		if (modals.length > 1) {
			// Remove duplicate modals, keep only the first one
			for (let i = 1; i < modals.length; i++) {
				modals[i].remove();
			}
		}
		
		this.modal = document.getElementById('cozy-mode-modal');
		
		if (!this.modal) {
		// Modal not found - this is okay, it will be set up when needed
		return;
		}

		this.backdrop = this.modal?.querySelector('.cozy-mode-backdrop');
		this.container = this.modal?.querySelector('.cozy-mode-container');
		this.content = this.modal?.querySelector('.cozy-mode-article');
		this.loading = this.modal?.querySelector('.cozy-mode-loading');
		this.closeButton = this.modal?.querySelector('.cozy-mode-close');
		this.controls = this.modal?.querySelector('.cozy-mode-controls');

		if (this.content) {
		this.updateFocusableElements();
		}
	}

	debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		};
	}

	handleResize() {
		if (this.isActive) {
		this.updateFocusableElements();
		}
	}

	updateFocusableElements() {
		if (!this.modal) {
		return;
		}

		const focusableSelectors = [
		'button:not([disabled])',
		'[href]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
		];

		this.focusableElements = Array.from(
		this.modal.querySelectorAll(focusableSelectors.join(', '))
		);

		this.firstFocusableElement = this.focusableElements[0];
		this.lastFocusableElement =
		this.focusableElements[this.focusableElements.length - 1];
	}

	handleTabKey(event) {
		if (!this.isActive) {
		return;
		}

		if (event.shiftKey) {
		if (document.activeElement === this.firstFocusableElement) {
			event.preventDefault();
			this.lastFocusableElement?.focus();
		}
		} else if (document.activeElement === this.lastFocusableElement) {
		event.preventDefault();
		this.firstFocusableElement?.focus();
		}
	}

	async openModal() {
		try {
		// Ensure elements are set up before opening modal
		if (!this.modal || !this.content) {
			this.setupElements();
		}

		// If still not found, try to create or find the modal
		if (!this.modal) {
			// Check for duplicate modals and remove them
			const modals = document.querySelectorAll('#cozy-mode-modal');
			if (modals.length > 1) {
				for (let i = 1; i < modals.length; i++) {
					modals[i].remove();
				}
			}
			this.modal = document.getElementById('cozy-mode-modal');
		}

		if (!this.modal) {
			throw new Error('Cozy Mode modal not found. Please ensure the Cozy Mode block is present on the page.');
		}

		// Re-setup elements to ensure all references are current
		this.setupElements();

		if (!this.content) {
			throw new Error('Cozy Mode content container not found.');
		}

		this.previousActiveElement = document.activeElement;

		this.showModal();
		this.showLoadingState();

		const article = await Promise.race([
			this.extractContent(),
			this.timeoutPromise(10000),
		]);

		if (!article) {
			throw new Error('Content extraction failed or timed out');
		}

		this.populateModal(article);
		this.hideLoadingState();
		this.updateFocusableElements();
		this.firstFocusableElement?.focus();
		this.logPerformanceMetrics();

		const buttons = document.querySelectorAll('.cozy-mode-toggle');
		buttons.forEach((button) => this.setButtonLoading(button, false));
		} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Cozy Mode: Error opening modal:', error);
		this.hideLoadingState();
		this.showError(
			error.message || 'An error occurred while loading content'
		);

		const buttons = document.querySelectorAll('.cozy-mode-toggle');
		buttons.forEach((button) => this.setButtonLoading(button, false));

		throw error;
		}
	}

	timeoutPromise(ms) {
		return new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Operation timed out')), ms);
		});
	}

	showLoadingState() {
		if (this.loading) {
		this.loading.style.display = 'block';
		}
		if (this.content) {
		this.content.style.display = 'none';
		}
	}

	hideLoadingState() {
		if (this.loading) {
		this.loading.style.display = 'none';
		}
		if (this.content) {
		this.content.style.display = 'block';
		}
	}

	logPerformanceMetrics() {
		if ('performance' in window && this.performanceStart) {
		const loadTime = performance.now() - this.performanceStart;
		// eslint-disable-next-line no-console
		console.log(
			`Cozy Mode: Modal loaded in ${loadTime.toFixed(2)}ms`
		);

		if (typeof window.gtag !== 'undefined') {
			window.gtag('event', 'cozy_mode_load_time', {
				value: Math.round(loadTime),
				event_category: 'performance',
			});
		}
		}
	}

	async extractContent() {
		try {
		const documentClone = document.cloneNode(true);
		
		// Remove all Cozy Mode buttons and blocks from the cloned document
		const cozyButtons = documentClone.querySelectorAll('.cozy-mode-button-container');
		cozyButtons.forEach((button) => button.remove());
		
		// Remove entire Cozy Mode blocks
		const cozyBlocks = documentClone.querySelectorAll('.yokoi-cozy-mode-block');
		cozyBlocks.forEach((block) => block.remove());
		
		// Remove the modal markup itself
		const cozyModal = documentClone.querySelectorAll('.cozy-mode-modal');
		cozyModal.forEach((modal) => modal.remove());
		
		// Also remove any elements with cozy-mode classes
		const cozyElements = documentClone.querySelectorAll('[class*="cozy-mode"]');
		cozyElements.forEach((element) => element.remove());

		const reader = new Readability(documentClone);
		const article = reader.parse();

		if (!article) {
			throw new Error('Readability.js could not parse content');
		}

		return article;
		} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Cozy Mode: Content extraction failed:', error);
		return null;
		}
	}

	populateModal(article) {
		if (!this.modal || !this.content) {
		return;
		}

		const titleElement =
		this.modal.querySelector('.cozy-mode-title') || this.createTitle();
			if (titleElement) {
				titleElement.textContent =
					article.title ||
					window.cozyMode?.strings?.readingMode ||
					'Reading Mode';
			}

		// Clear content securely
		this.content.textContent = '';

		// Create article container
		const articleContent = document.createElement('div');
		articleContent.className = 'cozy-mode-article-content';
		
		// Security: Use DOMPurify if available, otherwise sanitize via DOM parsing
		// Readability.js already sanitizes content, but we add extra protection
		if (article.content) {
		// Create a temporary container to parse and sanitize HTML
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = article.content;
		
		// Remove all Cozy Mode elements that might have been included
		const cozyModeSelectors = [
			'.cozy-mode-button-container',
			'.cozy-mode-toggle',
			'.yokoi-cozy-mode-block',
			'.cozy-mode-modal',
			'.cozy-mode-backdrop',
			'.cozy-mode-container',
			'.cozy-mode-header',
			'.cozy-mode-title',
			'.cozy-mode-close',
			'.cozy-mode-content',
			'.cozy-mode-loading',
			'.cozy-mode-spinner',
			'.cozy-mode-article',
			'.cozy-mode-controls',
			'.cozy-mode-control',
			'[class*="cozy-mode"]',
			'[id*="cozy-mode"]'
		];
		
		cozyModeSelectors.forEach((selector) => {
			try {
				const elements = tempDiv.querySelectorAll(selector);
				elements.forEach((el) => el.remove());
			} catch (e) {
				// Ignore invalid selectors
			}
		});
		
		// Remove potentially dangerous elements
		const dangerousElements = tempDiv.querySelectorAll('script, iframe, object, embed, form, input, button[type="submit"]');
		dangerousElements.forEach((el) => el.remove());
		
		// Remove event handlers from attributes
		const allElements = tempDiv.querySelectorAll('*');
		allElements.forEach((el) => {
			Array.from(el.attributes).forEach((attr) => {
				if (attr.name.startsWith('on')) {
					el.removeAttribute(attr.name);
				}
			});
		});
		
		// Move sanitized content
		while (tempDiv.firstChild) {
			articleContent.appendChild(tempDiv.firstChild);
		}
		}

		// Final pass: Remove any Cozy Mode elements that might have slipped through
		// Only remove button/block elements, NOT control elements (those are part of the modal UI)
		const finalCozyElements = articleContent.querySelectorAll(
			'.cozy-mode-button-container, .cozy-mode-toggle, .yokoi-cozy-mode-block, [id*="cozy-mode"]'
		);
		finalCozyElements.forEach((el) => el.remove());
		
		this.enhanceContent(articleContent);
		this.content.appendChild(articleContent);
		this.applyStoredPreferences(articleContent);
		this.setupAnalytics(article);
		this.setupSecurity(articleContent);
		// Footer removed - controls are already in the modal UI
		// this.injectFooter(article);
		this.setupMutationObserver(articleContent);
		this.setupAccessibility();
		
		// Ensure font size is applied after content is loaded
		this.applyFontSize();
	}

	createTitle() {
		const header = this.modal?.querySelector('.cozy-mode-header');
		if (!header) {
		return null;
		}
		const titleElement = document.createElement('h1');
		titleElement.className = 'cozy-mode-title';
		titleElement.id = 'cozy-mode-title';
		header.insertBefore(titleElement, header.firstChild);
		return titleElement;
	}

	enhanceContent(articleContent) {
		// Optimize images with lazy loading and error handling
		const images = articleContent.querySelectorAll('img');
		images.forEach((img) => {
		img.loading = 'lazy';
		img.decoding = 'async';
		img.classList.add('cozy-mode-image');
		// Use passive listener for error handling
		img.addEventListener('error', () => {
			img.classList.add('cozy-mode-image-error');
		}, { passive: true, once: true });
		});

		// Secure external links
		const links = articleContent.querySelectorAll('a');
		links.forEach((link) => {
		try {
			const url = new URL(link.href, window.location.href);
			if (url.hostname !== window.location.hostname) {
				link.target = '_blank';
				link.rel = 'noopener noreferrer nofollow';
			}
		} catch (e) {
			// Invalid URL - make it safe
			link.removeAttribute('href');
		}
		link.classList.add('cozy-mode-link');
		// Track clicks with passive listener
		link.addEventListener('click', () => {
			this.trackLinkClick(link.href);
		}, { passive: true });
		});

		// Add semantic classes for styling (batch operations for performance)
		const headings = articleContent.querySelectorAll('h2, h3, h4');
		headings.forEach((heading) => {
		heading.classList.add('cozy-mode-heading');
		});

		const paragraphs = articleContent.querySelectorAll('p');
		paragraphs.forEach((paragraph) => {
		paragraph.classList.add('cozy-mode-paragraph');
		});
	}

	applyStoredPreferences(articleContent) {
		if (!articleContent) {
		return;
		}

		articleContent.style.fontSize = `${this.currentFontSize}px`;

		if (this.isDarkMode) {
		this.modal?.classList.add('cozy-mode-dark');
		} else {
		this.modal?.classList.remove('cozy-mode-dark');
		}
	}

	setupAnalytics(article) {
		if (typeof window.gtag !== 'undefined') {
		window.gtag('event', 'cozy_mode_open', {
			event_category: 'engagement',
			event_label: article.title || '',
		});
		}
	}

	setupSecurity(articleContent) {
		// Remove all script tags and dangerous elements
		const dangerousSelectors = [
		'script',
		'iframe',
		'object',
		'embed',
		'form',
		'input[type="submit"]',
		'button[type="submit"]',
		];
		dangerousSelectors.forEach((selector) => {
		articleContent.querySelectorAll(selector).forEach((el) => el.remove());
		});

		// Remove event handlers from all attributes
		const allElements = articleContent.querySelectorAll('*');
		allElements.forEach((el) => {
		Array.from(el.attributes).forEach((attr) => {
			// Remove onclick, onerror, etc.
			if (attr.name.startsWith('on') && attr.name.length > 2) {
				el.removeAttribute(attr.name);
			}
			// Remove javascript: protocol from href/src
			if ((attr.name === 'href' || attr.name === 'src') && attr.value.trim().toLowerCase().startsWith('javascript:')) {
				el.removeAttribute(attr.name);
			}
		});
		});

		// Secure link handling with passive listeners
		articleContent.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', (event) => {
			try {
				const url = new URL(link.href, window.location.href);
				const isTrusted = this.isTrustedDomain(url.hostname);
				if (!isTrusted) {
					event.preventDefault();
					window.open(url.href, '_blank', 'noopener,noreferrer');
				}
			} catch (e) {
				// Invalid URL - prevent navigation
				event.preventDefault();
			}
		}, { passive: false });
		});
	}

		isTrustedDomain(hostname) {
			const trustedDomains = [window.location.hostname];
			const config = window.cozyMode;
			if (
				config &&
				Array.isArray(config.trustedDomains) &&
				config.trustedDomains.length > 0
			) {
				trustedDomains.push(...config.trustedDomains);
			}
			return trustedDomains.includes(hostname);
		}

	injectFooter(article) {
		if (!this.content) {
		return;
		}

		const footer = document.createElement('footer');
		footer.className = 'cozy-mode-footer';
		
		// Create footer structure using DOM methods for security
		const metaDiv = document.createElement('div');
		metaDiv.className = 'cozy-mode-footer-meta';
		
		const titleP = document.createElement('p');
		titleP.textContent = article.title || '';
		metaDiv.appendChild(titleP);
		
			const enterP = document.createElement('p');
			enterP.textContent = window.cozyMode?.strings?.enterCozyMode || 'Enter Cozy Mode';
			metaDiv.appendChild(enterP);
			
			const actionsDiv = document.createElement('div');
			actionsDiv.className = 'cozy-mode-footer-actions';
			
			const toggleLabel = window.cozyMode?.strings?.toggleDarkMode || 'Toggle dark mode';
			const themeBtn = document.createElement('button');
			themeBtn.type = 'button';
			themeBtn.className = 'cozy-mode-control cozy-mode-theme-toggle';
			themeBtn.setAttribute('aria-label', toggleLabel);
			themeBtn.textContent = '🌙';
			actionsDiv.appendChild(themeBtn);
			
			const printLabel = window.cozyMode?.strings?.print || 'Print article';
		const printBtn = document.createElement('button');
		printBtn.type = 'button';
		printBtn.className = 'cozy-mode-control cozy-mode-print';
		printBtn.setAttribute('aria-label', printLabel);
		printBtn.textContent = '🖨️';
		actionsDiv.appendChild(printBtn);
		
		footer.appendChild(metaDiv);
		footer.appendChild(actionsDiv);
		this.content.appendChild(footer);
	}

	setupMutationObserver(articleContent) {
		if (!articleContent || typeof MutationObserver === 'undefined') {
		return;
		}

		// Store observer reference for cleanup
		this.mutationObserver = new MutationObserver((mutations) => {
		// Only process if images are added
		const hasNewImages = mutations.some((mutation) => {
			return Array.from(mutation.addedNodes).some((node) => {
				return node.nodeType === 1 && (node.tagName === 'IMG' || node.querySelector('img'));
			});
		});

		if (hasNewImages) {
			const images = articleContent.querySelectorAll('img');
			images.forEach((img) => {
				if (!img.hasAttribute('loading')) {
					img.loading = 'lazy';
				}
			});
		}
		});

		this.mutationObserver.observe(articleContent, {
		childList: true,
		subtree: true,
		});
	}

	setupAccessibility() {
		if (!this.modal) {
		return;
		}

		this.modal.setAttribute('aria-hidden', 'false');
		this.modal.setAttribute('role', 'dialog');
		this.modal.setAttribute('aria-modal', 'true');
			this.modal.setAttribute(
				'aria-label',
				window.cozyMode?.strings?.readingMode || 'Reading Mode'
			);
		this.modal.setAttribute('tabindex', '-1');

			if (this.closeButton) {
				this.closeButton.setAttribute(
					'aria-label',
					window.cozyMode?.strings?.closeCozyMode || 'Close Cozy Mode'
				);
			}

		if (this.controls) {
		this.controls.setAttribute('role', 'toolbar');
		const buttons = this.controls.querySelectorAll('button');
		buttons.forEach((button) => {
			button.setAttribute('tabindex', '0');
		});
		}
	}

	handleResizeObserver() {
		if (!('ResizeObserver' in window) || !this.content) {
		return;
		}

		const observer = new ResizeObserver(() => {
		const maxHeight = Math.min(window.innerHeight * 0.9, 800);
		this.content.style.maxHeight = `${maxHeight}px`;
		});

		observer.observe(this.content);
	}

	handlePrefersReducedMotion() {
		if (!this.modal) {
		return;
		}

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotion = () => {
		if (mediaQuery.matches) {
			this.modal.classList.add('cozy-mode-reduced-motion');
		} else {
			this.modal.classList.remove('cozy-mode-reduced-motion');
		}
		};

		mediaQuery.addEventListener('change', updateMotion);
		updateMotion();
	}

	showModal() {
		if (!this.modal) {
		return;
		}

		this.modal.hidden = false;
		this.modal.classList.add('active');
		this.createClickOverlay();
		document.body.classList.add('cozy-mode-open');
		this.isActive = true;
		this.handlePrefersReducedMotion();
		this.handleResizeObserver();
		this.trackEvent('open');
	}

	createClickOverlay() {
		if (!this.modal || this.modal.parentElement?.querySelector('.cozy-mode-click-overlay')) {
		return;
		}

		const overlay = document.createElement('div');
		overlay.className = 'cozy-mode-click-overlay';
		this.modal.parentElement.insertBefore(overlay, this.modal);
	}

	closeModal() {
		if (!this.modal) {
		return;
		}

		// Disconnect mutation observer to prevent memory leaks
		if (this.mutationObserver) {
		this.mutationObserver.disconnect();
		this.mutationObserver = null;
		}

		this.modal.classList.remove('active');
		this.modal.setAttribute('aria-hidden', 'true');

		const overlay = this.modal.parentElement?.querySelector('.cozy-mode-click-overlay');
		if (overlay) {
		overlay.remove();
		}

		setTimeout(() => {
		if (this.modal) {
			this.modal.hidden = true;
		}
		}, 300);

		document.body.classList.remove('cozy-mode-open');
		this.isActive = false;
		this.savePreferences();
		this.trackEvent('close');

		if (this.previousActiveElement instanceof HTMLElement) {
		this.previousActiveElement.focus();
		}
	}

	decreaseFontSize() {
		this.currentFontSize = Math.max(14, this.currentFontSize - 2);
		this.applyFontSize();
		this.trackEvent('font_decrease');
		this.savePreferences();
	}

	increaseFontSize() {
		this.currentFontSize = Math.min(28, this.currentFontSize + 2);
		this.applyFontSize();
		this.trackEvent('font_increase');
		this.savePreferences();
	}

	resetFontSize() {
		this.currentFontSize = 18;
		this.applyFontSize();
		this.trackEvent('font_reset');
		this.savePreferences();
	}

	applyFontSize() {
		const articleContent = this.modal?.querySelector(
			'.cozy-mode-article-content'
		);
		if (articleContent) {
			// Apply font size with !important to override any CSS
			articleContent.style.setProperty('font-size', `${this.currentFontSize}px`, 'important');
			
			// Also apply to all paragraphs and text elements within for better coverage
			const textElements = articleContent.querySelectorAll('p, li, span, div, h1, h2, h3, h4, h5, h6');
			textElements.forEach((el) => {
				// Only set if element doesn't have inline style already
				if (!el.style.fontSize) {
					el.style.fontSize = `${this.currentFontSize}px`;
				}
			});
		}
	}

	toggleTheme() {
		this.isDarkMode = !this.isDarkMode;

		if (this.modal) {
		this.modal.classList.toggle('cozy-mode-dark', this.isDarkMode);
		}

		this.trackEvent(this.isDarkMode ? 'dark_mode_on' : 'dark_mode_off');
		this.savePreferences();
	}

	printArticle() {
		const articleContent = this.modal?.querySelector(
			'.cozy-mode-article-content'
		);

		if (!articleContent) {
			if (window.yokoiDebug) {
				// eslint-disable-next-line no-console
				console.warn('Cozy Mode: Article content not found for printing');
			}
			return;
		}

		// Get the title
		const titleElement = this.modal?.querySelector('.cozy-mode-title');
		const title = titleElement?.textContent || 
			window.cozyMode?.strings?.readingMode || 
			'Reading Mode';

		// Security: Clone content and sanitize before printing
		const contentClone = articleContent.cloneNode(true);
		
		// Remove scripts and dangerous elements
		const scripts = contentClone.querySelectorAll('script, iframe, object, embed');
		scripts.forEach((el) => el.remove());
		
		// Remove event handlers
		const allElements = contentClone.querySelectorAll('*');
		allElements.forEach((el) => {
			Array.from(el.attributes).forEach((attr) => {
				if (attr.name.startsWith('on')) {
					el.removeAttribute(attr.name);
				}
			});
		});

		// Create print window
		const printWindow = window.open('', '_blank', 'noopener,noreferrer');
		if (!printWindow) {
			if (window.yokoiDebug) {
				// eslint-disable-next-line no-console
				console.warn('Cozy Mode: Print window blocked by popup blocker');
			}
			return;
		}

		const sanitizedContent = contentClone.innerHTML;
		const escapedTitle = this.escapeHTML(title);
		
		printWindow.document.open();
		printWindow.document.write(
			'<!DOCTYPE html><html><head><title>' + escapedTitle + '</title>' +
			'<style>body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; } ' +
			'img { max-width: 100%; height: auto; } ' +
			'h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; } ' +
			'p { margin-bottom: 1em; }</style></head><body>' + 
			sanitizedContent + 
			'</body></html>'
		);
		printWindow.document.close();
		
		// Wait for content to load before printing
		printWindow.onload = () => {
			setTimeout(() => {
				printWindow.focus();
				printWindow.print();
			}, 250);
		};

		this.trackEvent('print');
	}

	trackEvent(action) {
		if (typeof window.gtag !== 'undefined') {
		window.gtag('event', `cozy_mode_${action}`, {
			event_category: 'engagement',
		});
		}
	}

	trackLinkClick(url) {
		if (typeof window.gtag !== 'undefined') {
		window.gtag('event', 'cozy_mode_link_click', {
			event_category: 'engagement',
			event_label: url,
		});
		}
	}

	showError(message) {
		if (!this.modal) {
		return;
		}

		this.hideLoadingState();

		const errorContainer =
		this.modal.querySelector('.cozy-mode-error') ||
		this.createErrorContainer();

		if (!errorContainer) {
		return;
		}

		// Use DOM methods instead of innerHTML for security
		errorContainer.textContent = '';
		
		const errorContent = document.createElement('div');
		errorContent.className = 'cozy-mode-error-content';
		
			const errorP = document.createElement('p');
			errorP.textContent = message ||
				window.cozyMode?.strings?.error ||
				'An error occurred.';
			errorContent.appendChild(errorP);
			
			const closeButton = document.createElement('button');
			closeButton.type = 'button';
			closeButton.className = 'cozy-mode-control cozy-mode-close-error';
			closeButton.textContent = window.cozyMode?.strings?.closeCozyMode || 'Close Cozy Mode';
		errorContent.appendChild(closeButton);
		
		errorContainer.appendChild(errorContent);
		errorContainer.style.display = 'block';
	}

	createErrorContainer() {
		if (!this.modal) {
		return null;
		}

		const errorContainer = document.createElement('div');
		errorContainer.className = 'cozy-mode-error';
		this.modal.appendChild(errorContainer);
		return errorContainer;
	}

	showModalError(message) {
		this.showError(message);
	}

	escapeHTML(str) {
		return str
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}
}

// Scoped initialization to prevent conflicts
const initializeCozyMode = () => {
	if (typeof window === 'undefined') {
		return;
	}

	// Prevent multiple initializations
	if (window.yokoiCozyModeInitialized) {
		return;
	}

	const cozyModeConfig = window.cozyMode;

	if (!cozyModeConfig) {
		// Config not available - wait for it with retries
		let attempts = 0;
		const maxAttempts = 10;
		const checkConfig = () => {
			if (window.cozyMode) {
				window.yokoiCozyModeInitialized = true;
				if (document.readyState === 'loading') {
					document.addEventListener('DOMContentLoaded', () => {
						if (!window.yokoiCozyModeInstance) {
							window.yokoiCozyModeInstance = new CozyMode();
						}
					}, { once: true, passive: true });
				} else {
					if (!window.yokoiCozyModeInstance) {
						window.yokoiCozyModeInstance = new CozyMode();
					}
				}
			} else {
				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(checkConfig, 50);
				}
			}
		};
		setTimeout(checkConfig, 50);
		return;
	}

	// Mark as initialized before creating instance
	window.yokoiCozyModeInitialized = true;

	// Initialize CozyMode instance
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			if (!window.yokoiCozyModeInstance) {
				window.yokoiCozyModeInstance = new CozyMode();
			}
		}, { once: true, passive: true });
	} else {
		if (!window.yokoiCozyModeInstance) {
			window.yokoiCozyModeInstance = new CozyMode();
		}
	}
};

// Only initialize if not already initialized
if (!window.yokoiCozyModeInitialized) {
	initializeCozyMode();
}


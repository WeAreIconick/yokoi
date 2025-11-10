import Readability from './readability';

const initializeCozyMode = () => {
	if (typeof window === 'undefined') {
		return;
	}

	const cozyModeConfig = window.cozyMode;

	if (!cozyModeConfig) {
		// eslint-disable-next-line no-console
		console.error('Cozy Mode: Localized data is not available');
		return;
	}

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
					version: cozyModeConfig.version || '1.0.0',
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
			document.addEventListener('click', (event) => {
				if (event.target.closest('.cozy-mode-toggle')) {
					event.preventDefault();
					this.handleToggleClick(event);
				}
			});

			document.addEventListener('click', (event) => {
				if (event.target.closest('.cozy-mode-close')) {
					event.preventDefault();
					this.closeModal();
				}
			});

			document.addEventListener('click', (event) => {
				if (!this.isActive || !this.modal) {
					return;
				}

				if (event.target.closest('.cozy-mode-toggle')) {
					return;
				}

				if (event.target.classList.contains('cozy-mode-click-overlay')) {
					this.closeModal();
				}
			});

			document.addEventListener('keydown', (event) => {
				if (event.key === 'Escape' && this.isActive) {
					this.closeModal();
				}
			});

			document.addEventListener('click', (event) => {
				const target = event.target.closest('.cozy-mode-control');
				if (!target) {
					return;
				}

				event.preventDefault();

				if (target.classList.contains('cozy-mode-font-decrease')) {
					this.decreaseFontSize();
				} else if (target.classList.contains('cozy-mode-font-reset')) {
					this.resetFontSize();
				} else if (target.classList.contains('cozy-mode-font-increase')) {
					this.increaseFontSize();
				} else if (target.classList.contains('cozy-mode-theme-toggle')) {
					this.toggleTheme();
				} else if (target.classList.contains('cozy-mode-print')) {
					this.printArticle();
				}
			});

			document.addEventListener('keydown', (event) => {
				if (!this.isActive) {
					return;
				}

				if (event.key === 'Tab') {
					this.handleTabKey(event);
				}
			});

			window.addEventListener(
				'resize',
				this.debounce(() => {
					this.handleResize();
				}, 250)
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
					icon.innerHTML =
						'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
				}
			} else {
				button.disabled = false;
				button.classList.remove('loading');
				const icon = button.querySelector('.cozy-mode-icon');
				if (icon) {
					icon.innerHTML =
						'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
			this.modal = document.getElementById('cozy-mode-modal');
			this.backdrop = this.modal?.querySelector('.cozy-mode-backdrop');
			this.container = this.modal?.querySelector('.cozy-mode-container');
			this.content = this.modal?.querySelector('.cozy-mode-article');
			this.loading = this.modal?.querySelector('.cozy-mode-loading');
			this.closeButton = this.modal?.querySelector('.cozy-mode-close');
			this.controls = this.modal?.querySelector('.cozy-mode-controls');

			if (!this.modal || !this.content) {
				// eslint-disable-next-line no-console
				console.error('Cozy Mode: Required elements not found');
				return;
			}

			this.updateFocusableElements();
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
				const cozyButtons =
					documentClone.querySelectorAll('.cozy-mode-button-container');
				cozyButtons.forEach((button) => button.remove());

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
			titleElement.textContent =
				article.title ||
				cozyModeConfig.strings?.readingMode ||
				'Reading Mode';

			this.content.innerHTML = '';

			const articleContent = document.createElement('div');
			articleContent.className = 'cozy-mode-article-content';
			articleContent.innerHTML = article.content || '';

			this.enhanceContent(articleContent);
			this.content.appendChild(articleContent);
			this.applyStoredPreferences(articleContent);
			this.setupAnalytics(article);
			this.setupSecurity(articleContent);
			this.injectFooter(article);
			this.setupMutationObserver(articleContent);
			this.setupAccessibility();
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
			const images = articleContent.querySelectorAll('img');
			images.forEach((img) => {
				img.loading = 'lazy';
				img.decoding = 'async';
				img.classList.add('cozy-mode-image');
				img.addEventListener('error', () => {
					img.classList.add('cozy-mode-image-error');
				});
			});

			const links = articleContent.querySelectorAll('a');
			links.forEach((link) => {
				link.target = '_blank';
				link.rel = 'noopener noreferrer nofollow';
				link.classList.add('cozy-mode-link');
				link.addEventListener('click', () => {
					this.trackLinkClick(link.href);
				});
			});

			Array.from({ length: 3 }, (_, index) =>
				articleContent.querySelectorAll(`h${index + 2}`)
			).forEach((headingSet) => {
				headingSet.forEach((heading) => {
					heading.classList.add('cozy-mode-heading');
				});
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
			const scripts = articleContent.querySelectorAll('script');
			scripts.forEach((script) => script.remove());

			articleContent.querySelectorAll('a').forEach((link) => {
				link.addEventListener('click', (event) => {
					const url = new URL(link.href, window.location.href);
					const isTrusted = this.isTrustedDomain(url.hostname);
					if (!isTrusted) {
						event.preventDefault();
						window.open(url.href, '_blank', 'noopener,noreferrer');
					}
				});
			});
		}

		isTrustedDomain(hostname) {
			const trustedDomains = [window.location.hostname];
			if (
				Array.isArray(cozyModeConfig.trustedDomains) &&
				cozyModeConfig.trustedDomains.length > 0
			) {
				trustedDomains.push(...cozyModeConfig.trustedDomains);
			}
			return trustedDomains.includes(hostname);
		}

		injectFooter(article) {
			if (!this.content) {
				return;
			}

			const footer = document.createElement('footer');
			footer.className = 'cozy-mode-footer';
			const enterLabel =
				cozyModeConfig.strings?.enterCozyMode || 'Enter Cozy Mode';
			const toggleLabel =
				cozyModeConfig.strings?.toggleDarkMode || 'Toggle dark mode';
			const printLabel =
				cozyModeConfig.strings?.print || 'Print article';
			footer.innerHTML = `
				<div class="cozy-mode-footer-meta">
					<p>${this.escapeHTML(article.title || '')}</p>
					<p>${this.escapeHTML(enterLabel)}</p>
				</div>
				<div class="cozy-mode-footer-actions">
					<button type="button" class="cozy-mode-control cozy-mode-theme-toggle" aria-label="${this.escapeHTML(
						toggleLabel
					)}">🌙</button>
					<button type="button" class="cozy-mode-control cozy-mode-print" aria-label="${this.escapeHTML(
						printLabel
					)}">🖨️</button>
				</div>
			`;

			this.content.appendChild(footer);
		}

		setupMutationObserver(articleContent) {
			if (!articleContent || typeof MutationObserver === 'undefined') {
				return;
			}

			const observer = new MutationObserver(() => {
				const images = articleContent.querySelectorAll('img');
				images.forEach((img) => {
					img.loading = 'lazy';
				});
			});

			observer.observe(articleContent, {
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
				cozyModeConfig.strings?.readingMode || 'Reading Mode'
			);
			this.modal.setAttribute('tabindex', '-1');

			if (this.closeButton) {
				this.closeButton.setAttribute(
					'aria-label',
					cozyModeConfig.strings?.closeCozyMode || 'Close Cozy Mode'
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
				articleContent.style.fontSize = `${this.currentFontSize}px`;
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
			const printWindow = window.open('', '_blank');
			if (!printWindow) {
				return;
			}

			const articleContent = this.modal?.querySelector(
				'.cozy-mode-article-content'
			);

			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
					<head>
						<title>${this.escapeHTML(
							cozyModeConfig.strings?.readingMode || 'Reading Mode'
						)}</title>
						<style>
							body { font-family: Georgia, serif; margin: 40px; }
							img { max-width: 100%; height: auto; }
						</style>
					</head>
					<body>
						${articleContent?.innerHTML || ''}
					</body>
				</html>
			`);

			printWindow.document.close();
			printWindow.focus();
			printWindow.print();

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

			errorContainer.innerHTML = `
				<div class="cozy-mode-error-content">
					<p>${this.escapeHTML(
						message ||
							cozyModeConfig.strings?.error ||
							'An error occurred.'
					)}</p>
					<button type="button" class="cozy-mode-control cozy-mode-close-error">
						${this.escapeHTML(
							cozyModeConfig.strings?.closeCozyMode || 'Close Cozy Mode'
						)}
					</button>
				</div>
			`;

			errorContainer.style.display = 'block';

			const closeButton = errorContainer.querySelector('.cozy-mode-close-error');
			if (closeButton) {
				closeButton.addEventListener('click', () => {
					errorContainer.style.display = 'none';
					this.closeModal();
				});
			}
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

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			new CozyMode();
		});
	} else {
		new CozyMode();
	}
};

initializeCozyMode();


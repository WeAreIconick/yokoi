/**
 * Readability.js - Local version for Cozy Mode.
 * Simplified adaptation of Mozilla's Readability for content extraction.
 */

class Readability {
	constructor(doc) {
		this.doc = doc;
		this.article = null;
	}

	parse() {
		try {
			const contentSelectors = [
				'article',
				'.entry-content',
				'.post-content',
				'.content',
				'#content',
				'main',
				'.main-content',
				'.article-content',
			];

			let contentElement = null;
			for (const selector of contentSelectors) {
				contentElement = this.doc.querySelector(selector);
				if (contentElement) {
					break;
				}
			}

			if (!contentElement) {
				contentElement = this.doc.body;
			}

			const title = this.getTitle();
			const content = this.cleanContent(contentElement);

			return {
				title,
				content,
				textContent: contentElement ? contentElement.textContent : '',
				length: contentElement ? contentElement.textContent.length : 0,
			};
		} catch (error) {
			// eslint-disable-next-line no-console
			// Silent error handling
			return null;
		}
	}

	getTitle() {
		const titleSelectors = [
			'h1',
			'.entry-title',
			'.post-title',
			'.page-title',
			'title',
		];

		for (const selector of titleSelectors) {
			const element = this.doc.querySelector(selector);
			if (element && element.textContent.trim()) {
				return element.textContent.trim();
			}
		}

		return this.doc.title || 'Untitled';
	}

	cleanContent(element) {
		if (!element) {
			return '';
		}

		const clonedElement = element.cloneNode(true);
		const unwantedSelectors = [
			'nav',
			'header',
			'footer',
			'.navigation',
			'.nav',
			'.menu',
			'.sidebar',
			'.widget',
			'.advertisement',
			'.ad',
			'.social-share',
			'.comments',
			'.comment',
			'noscript',
			'script',
			'style',
			'iframe',
			'object',
			'embed',
		];

		unwantedSelectors.forEach((selector) => {
			const elements = clonedElement.querySelectorAll(selector);
			elements.forEach((el) => el.remove());
		});

		this.cleanAttributes(clonedElement);

		return clonedElement.innerHTML;
	}

	cleanAttributes(element) {
		const attributesToRemove = [
			'onclick',
			'onload',
			'onerror',
			'onmouseover',
			'onmouseout',
			'onfocus',
			'onblur',
			'onchange',
			'onsubmit',
		];

		const allElements = element.querySelectorAll('*');
		allElements.forEach((el) => {
			attributesToRemove.forEach((attr) => {
				if (el.hasAttribute(attr)) {
					el.removeAttribute(attr);
				}
			});
		});
	}
}

export default Readability;


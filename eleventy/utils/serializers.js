/**
 * @todo make main image responsive
 * @todo make figure responsive
 * @todo make image responsive
 */

import urlFor from './imageUrl.js';

export const uxmComponents = {
	types: {
		// pre: ({ value }) => `<pre>${value.code}</pre>`,
		// mainImage: ({ value }) => `![${value.alt}](${urlFor(value).url()})`,
		heroImage: ({ value }) =>
			`<img src="${urlFor(value).url()}" alt="${value.altText || ''}">`,
		// figure: ({value}) => {
		// 	return `<figure class="illustration">
		// 						<img src="${urlFor(value).url()}" alt="${value.altText || ''}" ${value.outline ? 'class="outline"' : ''}>
		// 						${value.caption ? `<figcaption> ${value.caption} </figcaption>` : ''}</figure>`;
		// },
	},
};


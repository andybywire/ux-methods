import urlFor from '../../utils/imageUrl.js';

// need to get the aspect ratio from the image for article images.
// For layout images, do not specify in the content schema, and use a layout default.


/**
 * "The breakpoints in sizes should mirror your page’s breakpoints exactly. The length 
 * after each specifies the image’s width on the layout when that media query evaluates to 
 * true." Eric Portis
 * - this means I either need to pass these in, or have a different shortcode
 *   for different images. 
 */

 /**
 * Document Responsive Image
 * @param {string} image image _ref returned from the Sanity Content Lake 
 * @param {string} aspect aspect ratio expressed as a decimal:
 *    square (1), portrait (4:5 – 1.25), landscape (4:3 — .75), and 
 *    wide (16:9 – 0.5625)
 *    @todo: convert these to keywords
 * @param {*} src 
 * @param {*} sizes 
 * @param {*} classList 
 * @returns 
 */
export default function responsiveImage(image, aspect = 0.75, src = '320,640,900,1024, 1440', sizes = '100vw') {
	// const classList = image.outline ? 'outline' : '';
	const sizeArray = src.split(',');
	const firstSize = sizeArray[0];
	const lastSize = sizeArray[sizeArray.length - 1];
	const lastHeight = lastSize * aspect;
	const altText = image.altText;
	const srcSetContent = sizeArray
		.map((size) => {
			const height = Math.floor(size * aspect); // default is 4:3
			const url = urlFor(image).width(size).height(height).auto('format').url();

			return `${url} ${size}w`;
		})
		.join(',');
	
	// Ensure classList is a string
	const classListString = Array.isArray(classList) ? classList.join(' ') : classList;	

	return `<img src="${urlFor(image).width(firstSize)}"
						srcset="${srcSetContent}"
						sizes="${sizes}"
						class="${classListString}"
						width="${lastSize.trim()}"
						height="${lastHeight}"
						loading="lazy"
						alt="${altText}"
					>`;
	// height included to avoid layout shift: lets the browser know what the aspect ratio is
	// set loading to "eager" if above the fold
}

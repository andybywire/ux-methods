import urlFor from "./imageUrl.js";

 /**
 * Document Responsive Image
 * Adding `width` and `height` for the largest image provides the aspect ratio,
 * which will help to reduce CLS
 * @param {string} image image _ref returned from the Sanity Content Lake 
 * @param {string} aspect aspect ratio expressed as a decimal:
 *    square (1), portrait (4:5 = 1.25), landscape (4:3 = .75), and 
 *    wide (16:9 = 0.5625)
 *    @todo: convert these to keywords
 * @param {*} srcset the set of width-parameter adjusted URLs to provide
 * @param {*} sizes  should mirror design breakpoints 
 * @returns 
 */
 export default function responsiveImage(image, aspect = 0.75, srcset = '160,320,360,640,900,1024,1440', sizes = '(min-width: 36em)  5vw, 100vw') {
  // sizes — blows out image. to fix!
	const sizeArray = srcset.split(',');
	const firstSize = sizeArray[0];
	const lastSize = sizeArray[sizeArray.length - 1]; // can this just be [-1]?
	const lastHeight = lastSize * aspect;
	const altText = image.altText;
	const srcSetContent = sizeArray
		.map((size) => {
			const height = Math.floor(size * aspect); // default is 4:3
			const url = urlFor(image).width(size).height(height).auto('format').url();

			return `${url} ${size}w`;
		})
		.join(',');
	

	return `<img src="${urlFor(image).width(firstSize)}"
						srcset="${srcSetContent}"
						sizes="${sizes}"
						max-width="${lastSize.trim()}"
						max-height="${lastHeight}"
						loading="lazy"
						alt="${altText}"
					>`;
	// height included to avoid layout shift: lets the browser know what the aspect ratio is
	// set loading to "eager" if above the fold
}

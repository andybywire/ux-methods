import urlFor from '../../utils/imageUrl.js';

const sizeArray = ['375', '425', '768', '1024', '1290'];
const aspect = 0.5625; // 16:9 aspect ratio

export default function (image, width = '650', height = '250') {
	const firstSize = sizeArray[0];
	const lastSize = sizeArray[sizeArray.length - 1];
	const lastHeight = lastSize * aspect;
	const srcSetContent = sizeArray
		.map((size) => {
			const height = Math.floor(size * aspect);
			const url = urlFor(image).width(size).height(height).auto('format').url();

			return `${url} ${size}w`;
		})
		.join(',');
	const altText = image.altText;
	const classes = image.adjBright ? 'dim' : '';

	return `<img src="${urlFor(image).width(firstSize)}"
          alt="${altText}"
      >`;
    }
    
    // return `<img src="${urlFor(image).width(firstSize)}"
    //       class="${classes}"
    //       srcset="${srcSetContent}"
    //       sizes="(min-width: 40rem) calc((var(--max-width) - (1.5vw * 13)) / 12 * 8),
    //              100vw"
    //       width="${lastSize.trim()}"
    //       height="${lastHeight}"
    //       loading="lazy"
    //       alt="${altText}"
    //     >`;
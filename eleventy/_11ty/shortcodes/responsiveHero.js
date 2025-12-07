import urlFor from '../../utils/imageUrl.js'

/**
 * ## Responsive Hero Image Shortcode
 *
 * Generates a responsive hero image with multiple srcset options
 * for different screen sizes. This allows for optimized loading
 * of images based on the user's device and screen size.
 *
 * @param {Object} image - The image object containing metadata
 *  for the hero image.
 * @param {number} [imgSize=30] - The width of the image in viewport
 *  percentage for larger screens. Defaults to 30%, which is used
 *  for Methods. Disciplines use 50%.
 * @param {number} [aspect=0.75] - The aspect ratio of the image.
 *  Defaults to 0.75 (3:4) landscape ratio.
 *
 * @returns {string} An HTML string representing the responsive
 */
export default (image, imgSize = 30, aspect = 0.75) => {
  const srcset = [150, 300, 375, 425, 600, 750, 768, 850, 1200]
  const sizes = `(min-width: 800px) ${imgSize}vw`
  const srcSetContent = srcset
    .map((size) => {
      const url = urlFor(image)
        .width(size)
        .height(Math.floor(size * aspect))
        .auto('format')
        .url()
      return `${url} ${size}w`
    })
    .join(',')

  return `<img src="${urlFor(image).width(srcset[0])}"
            srcset="${srcSetContent}"
            sizes="${sizes}"
            max-width="${srcset[srcset.length - 1]}"
            max-height="${Math.floor(srcset[srcset.length - 1] * aspect)}"
            alt="${image.altText}"
          >`
}

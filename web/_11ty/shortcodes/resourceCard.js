import urlFor from '../../utils/imageUrl.js'

/**
 * ## Resource Card
 * Used for rendering method and discipline cards with responsive images.

 * @param {Object} resource - The resource object containing data for the card.
 * @param {Object} resource.heroImage - The object representing hero image metadata.
 *   - this entire object is supplied to the `urlFor` function to generate the parameterized image URL.
 * @param {string} resource.type - The type of the resource (e.g., "method", "discipline").
 * @param {string} resource.slug - The slug for the resource's URL.
 * @param {string} resource.title - The title of the resource.
 * @param {string} resource.metaDescription - A short description of the resource.
 * @param {string} [size='compact-card'] - The size of the card. Defaults to 'compact-card'.
 *   - 'compact-card': Uses a smaller image size (125px max width).
 *   - 'full-card': Uses a larger image size (375px max width).
 * 
 * @returns {string} An HTML string representing the resource card.
 */
export default (resource, size = 'compact-card') => {
  const image = resource.heroImage
  const srcset = [125,250,375,500,375,750,1025,1500] 
  // srcset is based on multiples of image max-widths for each card size
  const aspect = 0.75 // landscape 4:3
  const sizes =
    size == 'compact-card'
      ? '125px' // compact card image max width
      : '375px' // full card max width
  const srcSetContent = srcset
    .map((size) => {
      const height = Math.floor(size * aspect)
      const url = urlFor(resource.heroImage).width(size).height(height).auto('format').url()
      return `${url} ${size}w`
    })
    .join(',')

  return `<li class="card ${size}">
          <a href="/${resource.type}/${resource.slug}/">
            <img src="${urlFor(image).width(srcset[0])}"
              srcset="${srcSetContent}"
              sizes="${sizes}"
              max-width="${srcset[-1]}"
              max-height="${srcset[-1] * aspect}"
              loading="lazy"
              alt="${image.altText}"
            >
            <div>
              <h3>${resource.title}</h3>
              <p>${resource.metaDescription}</p>
            </div>
          </a>
        </li>`
}

import urlFor from '../../utils/imageUrl.js'

/**
 * ## External Resource Card
 * Used for rendering external resource cards with responsive images.
 * Use for external resources (links)
 * 
 * @param {Object} resource - The resource object containing data for 
 *  the card.
 * @param {Object} resource.resourceImage - The object representing 
 *  hero image metadata.
 *   - this entire object is supplied to the `urlFor` function to 
 *      generate the parameterized image URL.
 * 
 * @returns {string} An HTML string representing the external 
 *  resource card.
 */
export default (resource) => {
  const {resourceImage, author, publisher, title, resourceUrl} = resource

  const image = resourceImage ? urlFor(resourceImage) : '/icons/heroPlaceholder.svg'

  const srcset = [125, 250] // compact card image sizes
  const sizes = '125px' // compact card image max width
  const srcSetContent = srcset
    .map((size) => {
      const url = resourceImage
        ? urlFor(resourceImage).width(size).height(size).auto('format').url()
        : '/icons/heroPlaceholder.svg'
      return `${url} ${size}w`
    })
    .join(',')
  const altText = resourceImage?.altText ? resourceImage.altText : 'Placeholder image'

  const byline =
    author && publisher
      ? `${author} | ${publisher}`
      : publisher
        ? publisher
        : author
          ? author
          : 'External Link' // fallback for missing author/publisher

  return `<li class="resource-ext">
            <a href="${resourceUrl}">
            <img src="/r/img/icon/Document.svg"
                width="21"
                height="26"
                alt="Document icon"
                class="icon"
              >
              <img src="${image}"
                srcset="${srcSetContent}"
                sizes="${sizes}"
                max-width="${srcset[0]}"
                max-height="${srcset[0]}"
                loading="lazy"
                alt="${altText}"
                class="image"
              >
              <div class="content">
                <p class="title">${title}</p>
                <p class="--mt-0">
                  <span class="--font-emphasis --text-muted --text-md">${byline}</span>
                  <span class="icon"></span>
                </p>
              </div>
            </a>
          </li>`
}

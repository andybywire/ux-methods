import urlFor from '../../utils/imageUrl.js'

// test resources: Navigation, Accessibility

/**
 * External Resource Card
 * Use for external resources (links)
 * TODO: Make responsive to resize for different card and screen sizes
 * Example of card w/o an image: /method/AccessibilityEvaluation/
 */
export default (resource) => {
  const {resourceImage, author, publisher, title, resourceUrl} = resource

  const image = resourceImage ? urlFor(resourceImage) : '/icons/heroPlaceholder.svg'

  const byline =
    author && publisher
      ? `${author} | ${publisher}`
      : publisher
        ? publisher
        : author
          ? author
          : 'External Link' // fallback for missing author/publisher

  return `<li class="card compact-card resource">
            <a href="${resourceUrl}">
              <img src="${image}">
              <div>
                <h3>${title}</h3>
                <p>
                  <span class="byline">${byline}</span>
                  <span class="icon"></span>
                </p>
              </div>
            </a>
          </li>`
}

import urlFor from '../../utils/imageUrl.js'

/**
 * External Resource Card
 * Use for external resources (links)
 * TODO: Make responsive to resize for different card and screen sizes
 * Example of card w/o an image: /method/AccessibilityEvaluation/
 */
export default (resource) => {
  if (resource.resourceImage) {
    return `<li>
              <img src="${urlFor(resource.resourceImage)}">
              <a href="${resource.resourceUrl}">${ resource.title }</a>
              <p>${ resource.author } | ${ resource.publisher }</p>
            </li>`
  }
  return `<li>
              <a href="${resource.resourceUrl}">${ resource.title }</a>
              <p>${ resource.author } | ${ resource.publisher }</p>
          </li>`
  }
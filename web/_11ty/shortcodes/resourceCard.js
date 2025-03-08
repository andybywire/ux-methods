import urlFor from '../../utils/imageUrl.js'

/**
 * Resource Card
 * Use for method and discipline cards
 * TODO: Make responsive to resize for different card and screen sizes
 * Note that with paired shortcodes, Nunjucks tags and other shortcodes can be included. 
 */
export default (resource) => 
        `<li>
          <img src="${urlFor(resource.heroImage)}">
          <a href="/${resource.type}/${ resource.slug }/">${ resource.title }</a>
          <p>${ resource.metaDescription }</p>
        </li>`
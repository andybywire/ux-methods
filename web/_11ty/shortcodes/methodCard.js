import urlFor from '../../utils/imageUrl.js'

/**
 * Method Card
 * Use for method and discipline cards
 * TODO: Make responsive to resize for different card and screen sizes
 * Note that with paired shortcodes, Nunjucks tags and other shortcodes can be included. 
 */
export default (method) => 
        `<li>
          <img src="${urlFor(method.heroImage)}" style="width: 25%">
          <a href="/method/${ method.slug }/">${ method.title }</a>
          <p>${ method.metaDescription }</p>
        </li>`
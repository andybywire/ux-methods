import urlFor from '../../utils/imageUrl.js'

/**
 * Resource Card
 * Use for method and discipline cards
 * TODO: Make responsive to resize for different card and screen sizes
 * Note that with paired shortcodes, Nunjucks tags and other shortcodes can be included. 
 */
export default (resource, size = "compact-card") => 
        `<li class="card ${size}">
          <a href="/${resource.type}/${ resource.slug }/">
            <img src="${urlFor(resource.heroImage)}">
            <div>
              <h3>${ resource.title }</h3>
              <p>${ resource.metaDescription }</p>
            </div>
          </a>
        </li>`
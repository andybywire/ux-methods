import urlFor from '../../utils/imageUrl.js'

/**
 * External Resource Card
 * Use for external resources (links)
 * TODO: Make responsive to resize for different card and screen sizes
 * Example of card w/o an image: /method/AccessibilityEvaluation/
 */
export default (resource) => {
  if (resource.resourceImage) {
    return `<li class="card compact-card resource">
              <a href="${resource.resourceUrl}">
                <img src="${urlFor(resource.resourceImage)}">
                <div>
                  <h3>${ resource.title }</h3>
                  <p>
                    <span>
                      ${ resource.author } | ${ resource.publisher }
                    </span>
                    <span>
                      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </span>
                  </p>
                </div>
              </a>
            </li>`
  }
  return `<li class="card compact-card resource">
              <a href="${resource.resourceUrl}">
                <div>
                  <h3>${ resource.title }</h3>
                  <p>
                    <span>
                      ${ resource.author } | ${ resource.publisher }
                    </span>
                    <span>
                      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </span>
                  </p>
                </div>
              </a>
          </li>`
  }
import {client} from '../_11ty/utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'

// Map serializers to Portable Text components
function prepareMethod(method) {
  return {
    ...method,
    overview: toHTML(method.overview),
    steps: toHTML(method.steps),
    // lede: toHTML(article.lede, { components: afcComponents }),
  }
}

// Fetch methods from Sanity & prepare them for Eleventy
async function getMethods() {
  const methods = await client.fetch(groq`
    *[_type == "method"] | order(title) {
      title,
      "slug": slug.current,
      "uri": uri.current,
      "createdAt": dateStamp.createdAt,
      "revisedAt": dateStamp.revisedAt,
      metaDescription,
      "heroImage": {
        "caption": heroImage.caption,
        "altText": heroImage.alt,
        "url": heroImage.asset->url,
      },
      overview,
      steps,
      "outcomes": output[]->{
        prefLabel,
        definition,
      },
    }
  `)
  const preparedMethods = methods.map(prepareMethod)
  return preparedMethods
}

export default getMethods

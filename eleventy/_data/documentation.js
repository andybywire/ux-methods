import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'

// Map serializers to Portable Text components
function prepareDocs(documentation) {
  return {
    ...documentation,
    body: toHTML(documentation.body),
    // lede: toHTML(documentation.lede, { components: afcComponents }),
  }
}

// Fetch documentation from Sanity & prepare it for Eleventy
async function getDocs() {
  const docs = await client.fetch(groq`
    *[_type == "documentation"] | order(title) {
      title,
      "slug": slug.current,
      metaDescription,
      heroImage,
      body,
      metaDescription,
    }
  `)
  const preparedDocs = docs.map(prepareDocs)
  return preparedDocs
}

export default getDocs

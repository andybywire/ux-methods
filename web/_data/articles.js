import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'

// Map serializers to Portable Text components
function prepareArticle(article) {
  return {
    ...article,
    body: toHTML(article.body),
    // lede: toHTML(article.lede, { components: afcComponents }),
  }
}

// Fetch articles from Sanity & prepare them for Eleventy
async function getArticles() {
  const articles = await client.fetch(groq`
    *[_type == "article"] | order(title) {
      title,
      "slug": slug.current,
      metaDescription,
      heroImage,
      body,
      metaDescription,
    }
  `)
  const preparedArticles = articles.map(prepareArticle)
  return preparedArticles
}

export default getArticles

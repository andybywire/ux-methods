import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'

// Map serializers to Portable Text components
function prepareDiscipline(discipline) {
  return {
    ...discipline,
    overview: toHTML(discipline.overview),
    // lede: toHTML(article.lede, { components: afcComponents }),
  }
}

// Fetch disciplines from Sanity & prepare them for Eleventy
async function getDisciplines() {
  const disciplines = await client.fetch(groq`
    *[_type == "discipline"] | order(title) {
      title,
      "slug": slug.current,
      "uri": uri.current,
      "createdAt": dateStamp.createdAt,
      "revisedAt": dateStamp.revisedAt,
      metaDescription,
      heroImage,
      overview,
      "methods": *[
          _type == "method" 
          && ^._id in disciplinesReference[]._ref
        ]{
          title, 
          metaDescription,
          "slug": slug.current,
        }
    }
  `)
  const preparedDisciplines = disciplines.map(prepareDiscipline)
  return preparedDisciplines
}

export default getDisciplines

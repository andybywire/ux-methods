import {client} from '../utils/sanityClient.js'
import { toHTML } from '@portabletext/to-html'
import groq from 'groq'

function prepareMetadata(metadata) {
  return {
    ...metadata,
    colophon: toHTML(metadata.colophon),
    overview: toHTML(metadata.overview),
    credits: metadata.credits.map(credit => toHTML(credit.creditBody))
  }
}

async function getMetadata() {
  const metadata = await client.fetch(groq`
    *[_id == "siteSettings"]{
      title,
      tagline,
      description,
      overview,
      colophon,
      "credits": credits[]{
        creditBody
      }
    }[0]
  `)
  return prepareMetadata(metadata)
}

export default getMetadata
